import { Role } from '../../modules/users/entities/role.enum';

export const METADATA_KEYS = {
  ANONYMOUS: 'anonymous',
  ROLES: {
    ROLES: 'roles',
    SUPER_ADMIN: Role.SuperAdmin,
    MANAGER: Role.Manager,
    HQ: Role.HQ,
  },
};
