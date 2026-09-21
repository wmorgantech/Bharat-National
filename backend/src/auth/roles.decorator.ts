// guards/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Roles that may only be held by an Admin-table identity. */
export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
