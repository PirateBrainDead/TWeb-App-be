import { Injectable } from '@nestjs/common';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UsersValidationService } from './users-validation.service';
import { hash } from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { UserPasswordChangedEvent } from '../dto/users.event';
import dayjs from 'dayjs';
import { DATETIME_FORMAT } from '../../../shared/constants/date.constants';
import { dateNowFormatted } from '../../../shared/utils/date.utils';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { UsersRepository } from '../users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersValidationService: UsersValidationService,
    private readonly usersRepository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly cls: CellClsService,
  ) {}

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepository.findById(this.cls.userId, this.cls.storeId);

    this.usersValidationService.validateUserExists(user);
    await this.usersValidationService.validatePasswordMatching(changePasswordDto.oldPassword, user.password);

    user.password = await hash(changePasswordDto.newPassword, 10);
    const passwordChangedAt = dateNowFormatted(DATETIME_FORMAT);
    user.lastPasswordChangedDate = passwordChangedAt;
    await this.usersRepository.update(user);

    const data: UserPasswordChangedEvent = {
      userId: this.cls.userId,
      storeId: this.cls.storeId,
      passwordChangedAt,
    };
    this.eventEmitter.emit(EVENTS.USERS.PASSWORD_CHANGED, data);

    return true;
  }
}
