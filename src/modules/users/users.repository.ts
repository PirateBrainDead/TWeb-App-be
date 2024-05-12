import { Injectable } from '@nestjs/common';
import { DB_KEYS } from '../../shared/utils/db.utils';
import { CellClsService } from '../libs/cls/cell-cls.service';
import { Repository } from '../../shared/repository/repository.service';
import { DeviceToken, User } from './entities/user.entity';
import { Store } from '../stores/entity/store.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersRepository {
  constructor(private readonly repository: Repository, private readonly cls: CellClsService) {}

  get dbKey(): string {
    return DB_KEYS.USERS.ALL_BY_STORE(this.cls.storeId);
  }

  async findAll(storeId?: string): Promise<User[]> {
    const dbKey = DB_KEYS.USERS.ALL_BY_STORE(storeId ?? this.cls.storeId);
    return await this.repository.findAll<User>(dbKey);
  }

  async findAllUsernamesFromStores(stores: Store[]): Promise<string[]> {
    const dbKeys = stores.map((store) => DB_KEYS.USERS.ALL_BY_STORE(store.id));
    const allUsers = await this.repository.findMany<User>(...dbKeys, DB_KEYS.USERS.SUPER_ADMINS);
    return allUsers.flatMap((users) => users.map((a) => a.username));
  }

  async findById(id: string, storeId?: string): Promise<User> {
    const dbKey = !storeId ? DB_KEYS.USERS.SUPER_ADMINS : DB_KEYS.USERS.ALL_BY_STORE(storeId);
    return await this.repository.findOne<User>(dbKey, id);
  }

  async findByUsername(username: string, storeId?: string): Promise<User> {
    const dbKey = !storeId ? DB_KEYS.USERS.SUPER_ADMINS : DB_KEYS.USERS.ALL_BY_STORE(storeId);
    const users = await this.repository.findAll<User>(dbKey);
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  async findAllByRole(role: string, storeId: string): Promise<User[]> {
    const dbKey = DB_KEYS.USERS.ALL_BY_STORE(storeId);
    const users = await this.repository.findAll<User>(dbKey);
    return users.filter((u) => u.role.toLowerCase() === role.toLowerCase());
  }

  async findAllDeviceTokensFromStore(storeId: string, role?: string): Promise<DeviceToken[]> {
    const users = role ? await this.findAllByRole(role, storeId) : await this.findAll(storeId);
    return users.filter((user) => user.deviceTokens).flatMap((user) => user.deviceTokens);
  }

  async create(user: Omit<User, 'id'>, storeId: string): Promise<User> {
    const dbKey = DB_KEYS.USERS.ALL_BY_STORE(storeId);
    const newUser: User = { id: uuidv4(), ...user };
    await this.repository.create<User>(dbKey, newUser);
    return newUser;
  }

  async update(user: User): Promise<void> {
    await this.repository.update<User>(this.dbKey, user);
  }
}
