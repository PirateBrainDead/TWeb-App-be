import { Injectable } from '@nestjs/common';
import { DB_KEYS } from '../../shared/utils/db.utils';
import { Repository } from '../../shared/repository/repository.service';
import { v4 as uuidv4 } from 'uuid';
import { Store } from './entity/store.entity';

@Injectable()
export class StoresRepository {
  constructor(private readonly repository: Repository) {}

  get dbKey(): string {
    return DB_KEYS.STORES;
  }

  async findAll(): Promise<Store[]> {
    return await this.repository.findAll<Store>(this.dbKey);
  }

  async findById(id: string): Promise<Store> {
    return await this.repository.findOne<Store>(this.dbKey, id);
  }

  async create(store: Omit<Store, 'id'>): Promise<Store> {
    const newStore: Store = { id: uuidv4(), ...store };
    await this.repository.create<Store>(this.dbKey, newStore);
    return newStore;
  }

  async update(store: Store): Promise<void> {
    await this.repository.update<Store>(this.dbKey, store);
  }
}
