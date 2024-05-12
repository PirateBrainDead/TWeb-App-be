import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Put, Delete } from '@nestjs/common';
import { SectionsService } from './services/sections.service';
import {
  ApiCreateSection,
  ApiDeleteSection,
  ApiEditSection,
  ApiGetSections,
  ApiUpdatePlanningStatus,
} from './sections.swagger';
import { Section } from './entity/section.entity';
import { UpdateSectionPlanningDto } from './dto/update-section-planning.dto';
import { HasRoles } from '../../shared/decorators/roles/has-roles.decorator';
import { Role } from '../users/entities/role.enum';
import { CreateSectionDto } from './dto/create-section.dto';
import { EditSectionDto } from './dto/edit-section.dto';

@ApiBearerAuth()
@ApiTags('sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @ApiGetSections()
  @Get()
  @HasRoles(Role.Manager, Role.HQ)
  async findAll(): Promise<Section[]> {
    return await this.sectionsService.findAllByStoreId();
  }

  @ApiCreateSection()
  @Post()
  @HasRoles(Role.Manager)
  async create(@Body() createSectionDto: CreateSectionDto): Promise<boolean> {
    return await this.sectionsService.create(createSectionDto);
  }

  @ApiUpdatePlanningStatus()
  @Put('planning-status')
  @HasRoles(Role.Manager)
  async updatePlanningStatus(@Body() updateSectionPlanningDto: UpdateSectionPlanningDto): Promise<boolean> {
    return await this.sectionsService.updatePlanningStatus(updateSectionPlanningDto);
  }

  @ApiEditSection()
  @Put()
  @HasRoles(Role.Manager)
  async editSection(@Body() editSectionDto: EditSectionDto): Promise<boolean> {
    return await this.sectionsService.editSection(editSectionDto);
  }

  @ApiDeleteSection()
  @Delete()
  @HasRoles(Role.Manager)
  async delete(@Body() sectionIds: string[]) {
    return this.sectionsService.delete(sectionIds);
  }
}
