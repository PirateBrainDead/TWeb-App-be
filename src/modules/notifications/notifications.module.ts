import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { UsersRepository } from '../users/users.repository';
import { Repository } from '../../shared/repository/repository.service';

@Module({
  providers: [NotificationsService, Repository, UsersRepository],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
