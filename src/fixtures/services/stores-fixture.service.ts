import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { DB_KEYS } from '../../shared/utils/db.utils';
import { Store } from '../../modules/stores/entity/store.entity';
import * as path from 'path';
import { Repository } from '../../shared/repository/repository.service';

@Injectable()
export class StoresFixtureService {
  constructor(private readonly repository: Repository) {}

  async seed(): Promise<Store[]> {
    console.log('Seeding stores...');

    const filePath = path.join(__dirname, '../data/stores.json');
    const storesJson = readFileSync(filePath, 'utf8');
    const stores = JSON.parse(storesJson) as Store[];

    await this.repository.createMany(DB_KEYS.STORES, stores);

    return stores;
  }
}
