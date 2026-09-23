import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RefreshToken } from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'crypto';
import {
  getRefreshAbsoluteTtlDays,
  getRefreshTokenTtlDays,
} from '../config/env';
import { PrismaService } from '../prisma/prisma.service';

export type PrincipalType = 'USER' | 'ADMIN';

export interface Principal {
  type: PrincipalType;
  id: number;
}

export interface IssuedRefreshToken {
  /** Raw token. Returned to the caller once and never stored in plain text. */
  token: string;
  expiresAt: Date;
  absoluteExpiresAt: Date;
  familyId: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);
  private lastCleanupAt = 0;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * SHA-256 rather than bcrypt: the token is already 256 bits of entropy, so
   * there is nothing to brute force, and this runs on every refresh.
   */
  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private principalOf(row: RefreshToken): Principal {
    if (row.userId) return { type: 'USER', id: row.userId };
    if (row.adminId) return { type: 'ADMIN', id: row.adminId };

    // Should be unreachable: every row is written with exactly one owner.
    throw new UnauthorizedException('Refresh token has no owner');
  }

  /**
   * Creates a token. When `family` is supplied the token continues an existing
   * rotation chain and inherits its absolute expiry, so rotating never extends
   * the overall session.
   */
  async issue(
    principal: Principal,
    family?: { familyId: string; absoluteExpiresAt: Date },
  ): Promise<IssuedRefreshToken> {
    const token = randomBytes(32).toString('base64url');
    const now = Date.now();

    const absoluteExpiresAt =
      family?.absoluteExpiresAt ??
      new Date(now + getRefreshAbsoluteTtlDays() * DAY_MS);

    const slidingExpiresAt = new Date(now + getRefreshTokenTtlDays() * DAY_MS);

    // Never let the sliding window outlive the family ceiling.
    const expiresAt =
      slidingExpiresAt > absoluteExpiresAt ? absoluteExpiresAt : slidingExpiresAt;

    const familyId = family?.familyId ?? randomUUID();

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hash(token),
        familyId,
        userId: principal.type === 'USER' ? principal.id : null,
        adminId: principal.type === 'ADMIN' ? principal.id : null,
        expiresAt,
        absoluteExpiresAt,
      },
    });

    return { token, expiresAt, absoluteExpiresAt, familyId };
  }

  /**
   * Validates and single-use rotates a refresh token.
   *
   * Presenting a token that was already used is treated as theft: the entire
   * rotation chain is revoked so both the attacker and the legitimate client
   * are forced to re-authenticate.
   */
  async rotate(
    rawToken: string,
    expectedType: PrincipalType,
  ): Promise<{ principal: Principal; refresh: IssuedRefreshToken }> {
    const row = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(rawToken) },
    });

    if (!row) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (row.revokedAt) {
      this.logger.warn(
        `Refresh token reuse detected for family ${row.familyId}; revoking the family`,
      );
      await this.revokeFamily(row.familyId);
      throw new UnauthorizedException(
        'Refresh token reuse detected. Please sign in again.',
      );
    }

    const now = new Date();

    if (row.expiresAt <= now || row.absoluteExpiresAt <= now) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const principal = this.principalOf(row);

    if (principal.type !== expectedType) {
      // A storefront token must not be refreshable on the admin endpoint.
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Atomic compare-and-set: if a concurrent request rotated this row first,
    // updated.count is 0 and we treat it as reuse rather than issuing twice.
    const updated = await this.prisma.refreshToken.updateMany({
      where: { id: row.id, revokedAt: null },
      data: { revokedAt: now },
    });

    if (updated.count === 0) {
      this.logger.warn(
        `Concurrent rotation detected for family ${row.familyId}; revoking the family`,
      );
      await this.revokeFamily(row.familyId);
      throw new UnauthorizedException(
        'Refresh token reuse detected. Please sign in again.',
      );
    }

    const refresh = await this.issue(principal, {
      familyId: row.familyId,
      absoluteExpiresAt: row.absoluteExpiresAt,
    });

    const replacement = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(refresh.token) },
      select: { id: true },
    });

    if (replacement) {
      await this.prisma.refreshToken.update({
        where: { id: row.id },
        data: { replacedById: replacement.id },
      });
    }

    return { principal, refresh };
  }

  /** Per-device logout: revokes just the presented token. */
  async revoke(rawToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hash(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Revokes every token in one rotation chain. */
  async revokeFamily(familyId: string): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return result.count;
  }

  /** Logout-all: revokes every active session for a principal. */
  async revokeAllForPrincipal(principal: Principal): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        revokedAt: null,
        ...(principal.type === 'USER'
          ? { userId: principal.id }
          : { adminId: principal.id }),
      },
      data: { revokedAt: new Date() },
    });

    return result.count;
  }

  /**
   * Removes rows that can no longer be used: past their absolute expiry, or
   * revoked long enough ago that they are no longer useful for reuse detection.
   */
  async cleanupExpired(revokedRetentionDays = 30): Promise<number> {
    const now = new Date();
    const revokedCutoff = new Date(now.getTime() - revokedRetentionDays * DAY_MS);

    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { absoluteExpiresAt: { lt: now } },
          { revokedAt: { lt: revokedCutoff } },
        ],
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} expired refresh token(s)`);
    }

    return result.count;
  }

  /**
   * Opportunistic cleanup, run at most hourly per process and never awaited by
   * the request that triggers it. Avoids pulling in a scheduler dependency;
   * a real cron job would be the better long-term home.
   */
  maybeCleanup(): void {
    const now = Date.now();

    if (now - this.lastCleanupAt < CLEANUP_INTERVAL_MS) return;
    this.lastCleanupAt = now;

    void this.cleanupExpired().catch((error) =>
      this.logger.warn(`Refresh token cleanup failed: ${error?.message}`),
    );
  }
}
