import { RepositoryInterface } from './repository.interface';
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../modules/libs/redis/redis.service';

@Injectable()
export class Repository implements RepositoryInterface {
  constructor(private readonly db: RedisService) {}

  async findAll<T>(key: string): Promise<T[]> {
    return (await this.db.get<T[]>(key)) ?? [];
  }

  async findMany<T>(...keys: string[]): Promise<any> {
    return await this.db.mget<T>(...keys);
  }

  async findOne<T extends { id: string }>(key: string, id: string): Promise<T> {
    const all = await this.findAll<T>(key);
    return all.find((a) => a.id === id);
  }

  async findAllMatchingKeys(key: string): Promise<string[]> {
    return await this.db.getAllMatchingKeys(key);
  }

  async upsert<T>(key: string, data: T[]): Promise<void> {
    await this.db.set(key, data);
  }

  async create<T extends { id: string }>(key: string, newData: T): Promise<void> {
    const all = await this.findAll<T>(key);
    all.push(newData);
    await this.db.set(key, all);
  }

  async createOne<T>(key: string, data: T): Promise<void> {
    await this.db.set(key, data);
  }

  async createMany<T extends { id: string }>(key: string, newData: T[]): Promise<void> {
    const all = await this.findAll<T>(key);
    all.push(...newData);
    await this.db.set(key, all);
  }

  async update<T extends { id: string }>(key: string, data: T): Promise<void> {
    const all = await this.findAll<T>(key);
    const indexForChange = all.findIndex((a) => a.id === data.id);
    if (indexForChange !== -1) {
      all[indexForChange] = data;
    }
    await this.db.set(key, all);
  }

  async updateAll<T extends { id: string }>(key: string, data: T): Promise<void> {
    await this.db.set(key, data);
  }

  async delete<T extends { id: string }>(key: string, id: string): Promise<void> {
    const all = await this.findAll<T>(key);
    const indexForDelete = all.findIndex((a) => a.id === id);
    if (indexForDelete !== -1) {
      all.splice(indexForDelete, 1);
    }
    await this.db.set(key, all);
  }

  async deleteMany<T extends { id: string }>(key: string, ids: string[]): Promise<void> {
    const all = await this.findAll<T>(key);
    const filtered = all.filter((item) => !ids.includes(item.id));
    await this.db.set(key, filtered);
  }

  async deleteCollection(keys: string[]): Promise<void> {
    await this.db.deleteCollection(keys);
  }
}
