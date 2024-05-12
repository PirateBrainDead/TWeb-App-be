import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { DB_KEYS } from '../../shared/utils/db.utils';
import * as path from 'path';
import { Repository } from '../../shared/repository/repository.service';
import { Section } from '../../modules/sections/entity/section.entity';
import { Store } from '../../modules/stores/entity/store.entity';

@Injectable()
export class SectionsFixtureService {
  constructor(private readonly repository: Repository) {}

  async seed(store: Store): Promise<Section[]> {
    console.log('Seeding sections...');

    const filePath = path.join(__dirname, '../data/sections.json');
    const sectionsJSON = readFileSync(filePath, 'utf8');
    const sections = JSON.parse(sectionsJSON) as Section[];

    await this.repository.createMany(DB_KEYS.SECTIONS.ALL_BY_STORE(store.id), sections);

    return sections;
  }
}
