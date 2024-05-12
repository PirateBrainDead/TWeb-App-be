import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Message, NotificationData } from './dto/notifications.type';
import { UsersRepository } from '../users/users.repository';
import { CellClsService } from '../libs/cls/cell-cls.service';
import { UpdateDeviceTokenDto } from './dto/update-token.dto';
import { Role } from '../users/entities/role.enum';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class NotificationsService {
  constructor(private readonly usersRepository: UsersRepository, private readonly cls: CellClsService) {}
  async sendMulticast(message: Message): Promise<BatchResponse> {
    message.apns = {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    };

    const response = await admin.messaging().sendMulticast(message);
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push({ token: message.tokens[idx], messgae: resp.error });
        }
      });
      console.log('List of tokens that caused failures: ' + JSON.stringify(failedTokens));
    } else {
      console.log('Notifications sent to all clients successfully.' + message.tokens);
    }
    return response;
  }
  async updateDeviceToken(updateDeviceTokenDto: UpdateDeviceTokenDto): Promise<boolean> {
    const user = await this.usersRepository.findById(this.cls.userId, this.cls.storeId);

    const matchedDeviceTypeIndex = user.deviceTokens.findIndex(
      (deviceToken) => deviceToken.deviceType === updateDeviceTokenDto.deviceType,
    );

    if (matchedDeviceTypeIndex !== -1) {
      const matchedDeviceType = user.deviceTokens[matchedDeviceTypeIndex];
      if (typeof matchedDeviceType.deviceToken === 'string') {
        matchedDeviceType.deviceToken = [matchedDeviceType.deviceToken];
      }
      if (!(matchedDeviceType.deviceToken as string[]).includes(updateDeviceTokenDto.deviceToken)) {
        (matchedDeviceType.deviceToken as string[]).push(updateDeviceTokenDto.deviceToken);
      }
      matchedDeviceType.deviceToken = matchedDeviceType.deviceToken.filter((token) => token !== '');
    }

    this.usersRepository.update(user);
    return true;
  }

  async removeDeviceToken(updateDeviceTokenDto: UpdateDeviceTokenDto): Promise<boolean> {
    const user = await this.usersRepository.findById(this.cls.userId, this.cls.storeId);
    const matchedDeviceTypeIndex = user.deviceTokens.findIndex(
      (deviceToken) => deviceToken.deviceType === updateDeviceTokenDto.deviceType,
    );

    if (matchedDeviceTypeIndex !== -1) {
      const matchedDeviceType = user.deviceTokens[matchedDeviceTypeIndex];
      if (typeof matchedDeviceType.deviceToken === 'string') {
        if (matchedDeviceType.deviceToken === updateDeviceTokenDto.deviceToken) {
          matchedDeviceType.deviceToken = [];
        }
      } else {
        matchedDeviceType.deviceToken = (matchedDeviceType.deviceToken as string[]).filter(
          (token) => token !== updateDeviceTokenDto.deviceToken,
        );
      }
      this.usersRepository.update(user);
    }
    return true;
  }

  async sendNotificationsToHq(notification: NotificationData, storeId?: string): Promise<boolean> {
    const userDeviceTokens = await this.usersRepository.findAllDeviceTokensFromStore(
      storeId ?? this.cls.storeId,
      Role.HQ,
    );
    const tokens: string[] = userDeviceTokens.reduce((result, tokenInfo) => {
      if (tokenInfo.deviceToken) {
        const normalizedTokens = Array.isArray(tokenInfo.deviceToken) ? tokenInfo.deviceToken : [tokenInfo.deviceToken];
        result.push(...normalizedTokens.filter((token) => token !== ''));
      }
      return result;
    }, []);

    if (tokens.length) await this.sendMulticast({ notification, tokens });
    return true;
  }
}
