import { Role } from '../../../modules/users/entities/role.enum';
import { partition } from '../partition.utils';

const roles: Role[] = [Role.Manager, Role.HQ, Role.Manager, Role.SuperAdmin];

describe('Partition', () => {
  it('should divide list in two separate lists by filter', () => {
    const [admins, otherRoles] = partition<Role>(roles, (role) => role === Role.SuperAdmin);
    expect(admins).toEqual([Role.SuperAdmin]);
    expect(otherRoles).toEqual(roles.filter((a) => a !== Role.SuperAdmin));
  });
});
