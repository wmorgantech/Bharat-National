// guards/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * The single admin role this project recognises.
 *
 * There is deliberately no tiering: an Admin-table identity is either ADMIN or
 * it is not an admin at all. Adding a second admin tier would also need the
 * RolesGuard, the Admin.role column and every @Roles() site to agree, so the
 * value lives here rather than being spelled out at each call site.
 */
export const ADMIN_ROLE = 'ADMIN';

/** Roles that may only be held by an Admin-table identity. */
export const ADMIN_ROLES = [ADMIN_ROLE];

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
