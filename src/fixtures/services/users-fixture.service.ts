import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { DB_KEYS } from '../../shared/utils/db.utils';
import * as path from 'path';
import { Repository } from '../../shared/repository/repository.service';
import { User } from '../../modules/users/entities/user.entity';
import { Store } from '../../modules/stores/entity/store.entity';
import { Role } from '../../modules/users/entities/role.enum';
import { partition } from '../../shared/utils/partition.utils';

@Injectable()
export class UsersFixtureService {
  constructor(private readonly repository: Repository) {}

  async seed(store: Store): Promise<void> {
    console.log('Seeding users...');

    const filePath = path.join(__dirname, '../data/users.json');
    const usersJson = readFileSync(filePath, 'utf8');
    const users = JSON.parse(usersJson) as User[];

    const [admins, storeUsers] = partition<User>(users, (user) => user.role === Role.SuperAdmin);

    await this.repository.createMany(DB_KEYS.USERS.SUPER_ADMINS, admins);
    await this.repository.createMany(DB_KEYS.USERS.ALL_BY_STORE(store.id), storeUsers);
  }
}
