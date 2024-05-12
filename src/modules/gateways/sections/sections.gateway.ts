import { MessageBody, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { SectionsEvent, SectionsPlanningEvent } from '../../sections/dto/sections.event';

@WebSocketGateway({ namespace: 'sections', transports: ['websocket'] })
export class SectionsGateway {
  @WebSocketServer()
  private server: Server;

  @OnEvent(EVENTS.SECTIONS.CHANGES)
  handleSectionsChanges(@MessageBody() data: SectionsEvent): void {
    const { storeId, ...restData } = data;
    this.server.emit(`sections|store:${storeId}`, restData);
  }

  @OnEvent(EVENTS.SECTIONS.PLANNING)
  handleSectionPlanningChange(@MessageBody() data: SectionsPlanningEvent): void {
    const { storeId, ...restData } = data;
    this.server.emit(`sections-planning|store:${storeId}`, restData);
  }

  @OnEvent(EVENTS.SECTIONS.DELETED)
  handleSectionDeleteChange(@MessageBody() data: SectionsEvent): void {
    const { storeId, ...restData } = data;
    this.server.emit(`sections-delete|store:${storeId}`, restData);
  }

  @OnEvent(EVENTS.SECTIONS.DELETE_FAILED)
  handleSectionDeleteFailedChange(@MessageBody() data: SectionsEvent): void {
    const { storeId, ...restData } = data;
    this.server.emit(`sections-delete|store:${storeId}`, restData);
  }
}
