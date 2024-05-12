import { Role } from '../../../modules/users/entities/role.enum';
import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../../constants/metadata.keys';

export const HasRoles = (...roles: Role[]) => SetMetadata(METADATA_KEYS.ROLES.ROLES, roles);
