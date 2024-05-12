import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { StoreClearInfoEvent, StoreDeactivateEvent, StoreLeafletChangedEvent } from '../../stores/dto/stores.event';
import { dateNowFormatted } from '../../../shared/utils/date.utils';

@WebSocketGateway({ namespace: 'stores', transports: ['websocket'] })
export class StoresGateway {
  @WebSocketServer()
  private server: Server;

  @OnEvent(EVENTS.STORES.LEAFLET_CHANGED)
  handleLeafletChange({ storeId, leafletLink }: StoreLeafletChangedEvent): void {
    this.server.emit(`leaflet-changed|${storeId}`, leafletLink);
  }

  @OnEvent(EVENTS.STORES.CLEAR_ALL)
  handleClearAllInfo({ storeId }: StoreClearInfoEvent) {
    this.server.emit(`clear-all|${storeId}`, dateNowFormatted());
  }

  @OnEvent(EVENTS.STORES.DEACTIVATION)
  handleDeactivation({ storeId }: StoreDeactivateEvent): void {
    this.server.emit(`deactivation|${storeId}`);
  }
}
