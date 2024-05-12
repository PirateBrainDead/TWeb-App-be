import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { UserPasswordChangedEvent } from '../../users/dto/users.event';

@WebSocketGateway({ namespace: 'users', transports: ['websocket'] })
export class UsersGateway {
  @WebSocketServer()
  private server: Server;

  @OnEvent(EVENTS.USERS.PASSWORD_CHANGED)
  handlePasswordChange({ userId, storeId, passwordChangedAt }: UserPasswordChangedEvent): void {
    this.server.emit(`password-changed|user:${userId}|store:${storeId}`, passwordChangedAt);
  }
}
