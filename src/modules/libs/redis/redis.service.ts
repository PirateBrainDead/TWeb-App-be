import { Redis, RedisKey } from 'ioredis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from '../../../config/config.types';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.initConnection();
  }

  private initConnection(): void {
    const redisConfig = this.configService.get<RedisConfig>('redis');
    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
    });
  }

  async get<T>(key: string): Promise<T> {
    const value = await this.redis.get(key);
    return JSON.parse(value) as T;
  }

  async mget<T>(...keys: string[]): Promise<T[]> {
    const values = await this.redis.mget(keys);
    return values.map((value) => JSON.parse(value)) as T[];
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.redis.set(key, JSON.stringify(value));
  }

  async reset(): Promise<void> {
    await this.redis.flushdb();
  }

  async deleteCollection(keys: RedisKey[]): Promise<void> {
    await this.redis.del(keys);
  }

  async getAllMatchingKeys(key: string): Promise<string[]> {
    return await this.redis.keys(key);
  }
}
