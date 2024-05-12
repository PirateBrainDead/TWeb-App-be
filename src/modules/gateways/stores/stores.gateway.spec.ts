import { Test, TestingModule } from '@nestjs/testing';
import { SocketModule } from '@nestjs/websockets/socket-module';
import { Server } from 'socket.io';
import { storeIdMock } from '../../tasks/tests/__mocks__/tasks.mocks';
import { StoresGateway } from './stores.gateway';

describe('StoresGateway', () => {
  const websocketServer: Server = new Server(85, { transports: ['websocket'] });
  let service: StoresGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SocketModule],
      providers: [StoresGateway],
    }).compile();

    service = module.get<StoresGateway>(StoresGateway);
    service['server'] = websocketServer;
  });
  afterEach(() => {
    websocketServer.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should call handleLeafletChange', () => {
    jest.spyOn(service['server'], 'emit');
    const handleLeafletChangeFn = jest.spyOn(service, 'handleLeafletChange');
    service.handleLeafletChange({ storeId: storeIdMock, leafletLink: '' });
    expect(handleLeafletChangeFn).toBeCalled();
  });
  it('should call handleClearAllInfo', () => {
    jest.spyOn(service['server'], 'emit');
    const handleClearAllInfoFn = jest.spyOn(service, 'handleClearAllInfo');
    service.handleClearAllInfo({ storeId: storeIdMock });
    expect(handleClearAllInfoFn).toBeCalled();
  });
});
