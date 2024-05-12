import { MessageBody, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { TasksEvent } from '../../tasks/dto/tasks.event';

@WebSocketGateway({ namespace: 'tasks', transports: ['websocket'] })
export class TasksGateway {
  @WebSocketServer()
  private server: Server;

  @OnEvent(EVENTS.TASKS.DAILY)
  handleDailyTasksChanges(@MessageBody() data: TasksEvent): void {
    const { storeId, ...restData } = data;
    this.server.emit(`daily|store:${storeId}`, restData);
  }

  @OnEvent(EVENTS.TASKS.REPEATABLE)
  handleRepeatableTasksChanges(@MessageBody() data: TasksEvent): void {
    const { storeId, ...restData } = data;
    this.server.emit(`repeatable|store:${storeId}`, restData);
  }
}
