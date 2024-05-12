import { Injectable } from '@nestjs/common';
import { DB_KEYS } from '../../shared/utils/db.utils';
import { CellClsService } from '../libs/cls/cell-cls.service';
import { Repository } from '../../shared/repository/repository.service';
import { Section } from './entity/section.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateSectionDto } from './dto/create-section.dto';

@Injectable()
export class SectionsRepository {
  constructor(private readonly repository: Repository, private readonly cls: CellClsService) {}

  get dbKey(): string {
    return DB_KEYS.SECTIONS.ALL_BY_STORE(this.cls.storeId);
  }

  async findAll(): Promise<Section[]> {
    return await this.repository.findAll<Section>(this.dbKey);
  }

  async findById(id: string): Promise<Section> {
    return await this.repository.findOne<Section>(this.dbKey, id);
  }

  async create(sectionDto: CreateSectionDto): Promise<Section> {
    const newSection: Section = { ...sectionDto, id: uuidv4(), plannedDays: [] };
    await this.repository.create<Section>(this.dbKey, newSection);
    return newSection;
  }

  async update(section: Section): Promise<void> {
    await this.repository.update<Section>(this.dbKey, section);
  }

  async updateSectionName(id: string, newName: string): Promise<boolean> {
    const section = await this.findById(id);
    if (!section) {
      throw new Error(`Section with ID "${id}" not found.`);
    }
    section.name = newName;
    await this.update(section);
    return true;
  }

  async delete(id: string, storeId?: string): Promise<void> {
    const dbKey = DB_KEYS.SECTIONS.ALL_BY_STORE(storeId ?? this.cls.storeId);
    await this.repository.delete<Section>(dbKey, id);
  }
}
