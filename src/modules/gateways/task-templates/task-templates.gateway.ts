import { MessageBody, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { TaskTemplatesEvent } from '../../task-templates/dto/task-templates.event';

@WebSocketGateway({ namespace: 'task-templates', transports: ['websocket'] })
export class TaskTemplatesGateway {
  @WebSocketServer()
  private server: Server;

  @OnEvent(EVENTS.TASK_TEMPLATES.CHANGES)
  handleTaskTemplatesChanges(@MessageBody() data: TaskTemplatesEvent): void {
    const { userId, ...restData } = data;
    this.server.emit(`task-templates|user:${userId}`, restData);
  }
}
