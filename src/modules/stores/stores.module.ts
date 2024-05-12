import { Module } from '@nestjs/common';
import { StoresService } from './services/stores.service';
import { StoresController } from './stores.controller';
import { Repository } from '../../shared/repository/repository.service';
import { UsersRepository } from '../users/users.repository';
import { StoresRepository } from './stores.repository';
import { StoresValidationService } from './services/stores-validation.service';
import { UsersValidationService } from '../users/services/users-validation.service';

@Module({
  controllers: [StoresController],
  providers: [
    StoresService,
    StoresValidationService,
    UsersValidationService,
    Repository,
    StoresRepository,
    UsersRepository,
  ],
})
export class StoresModule {}
