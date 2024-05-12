import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Patch, Post, Put } from '@nestjs/common';
import { StoreActivationDto, UpdateStoreDto } from './dto/update-store.dto';
import { StoresService } from './services/stores.service';
import {
  ApiCreateStore,
  ApiGetAllStores,
  ApiGetUserStore,
  ApiUpdateActivation,
  ApiUpdateStore,
} from './stores.swagger';
import { HasRoles } from '../../shared/decorators/roles/has-roles.decorator';
import { Role } from '../users/entities/role.enum';
import { Store } from './entity/store.entity';
import { StoreWithUsers } from './dto/user-stores.dto';
import { CreateStoreDto } from './dto/create-store.dto';

@ApiBearerAuth()
@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @ApiGetAllStores()
  @Get()
  @HasRoles(Role.SuperAdmin)
  async findAll(): Promise<StoreWithUsers[]> {
    return await this.storesService.findAll();
  }

  @ApiGetUserStore()
  @Get('by-current-user')
  @HasRoles(Role.Manager, Role.HQ)
  async findByCurrentUserStore(): Promise<Store> {
    return await this.storesService.findById();
  }

  @ApiCreateStore()
  @Post()
  @HasRoles(Role.SuperAdmin)
  async create(@Body() createStoreDto: CreateStoreDto): Promise<boolean> {
    return await this.storesService.create(createStoreDto);
  }

  @ApiUpdateStore()
  @Put()
  @HasRoles(Role.Manager)
  async update(@Body() updateStoreDto: UpdateStoreDto): Promise<boolean> {
    return await this.storesService.update(updateStoreDto);
  }

  @ApiUpdateActivation()
  @Patch('activation')
  @HasRoles(Role.SuperAdmin)
  async updateActivation(@Body() storeActivationDto: StoreActivationDto): Promise<boolean> {
    return await this.storesService.updateActivation(storeActivationDto);
  }
}
