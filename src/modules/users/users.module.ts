import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { Repository } from '../../shared/repository/repository.service';
import { UsersService } from './services/users.service';
import { UsersValidationService } from './services/users-validation.service';
import { CellClsService } from '../libs/cls/cell-cls.service';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersValidationService, Repository, UsersRepository, CellClsService],
})
export class UsersModule {}
