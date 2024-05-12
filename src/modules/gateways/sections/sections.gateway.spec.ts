import { Test, TestingModule } from '@nestjs/testing';
import { SocketModule } from '@nestjs/websockets/socket-module';
import { Server } from 'socket.io';
import { EventSyncStatus } from '../../tasks/dto/tasks.event';
import { savedSectionsMock } from '../../sections/tests/__mocks__/sections.mocks';
import { SectionsGateway } from './sections.gateway';

describe('SectionsGateway', () => {
  const websocketServer: Server = new Server(85, { transports: ['websocket'] });
  let service: SectionsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SocketModule],
      providers: [SectionsGateway],
    }).compile();

    service = module.get<SectionsGateway>(SectionsGateway);
    service['server'] = websocketServer;
  });
  afterEach(() => {
    websocketServer.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should call handleSectionsChanges', () => {
    jest.spyOn(service['server'], 'emit');
    const handleSectionsChangesFn = jest.spyOn(service, 'handleSectionsChanges');
    service.handleSectionsChanges({
      storeId: '',
      sections: savedSectionsMock,
      syncStatus: EventSyncStatus.CREATED,
    });
    expect(handleSectionsChangesFn).toBeCalled();
  });
  it('should call handleSectionPlanningChange', () => {
    jest.spyOn(service['server'], 'emit');
    const handleSectionPlanningChangeFn = jest.spyOn(service, 'handleSectionPlanningChange');
    service.handleSectionPlanningChange({
      storeId: '',
      sectionId: '',
      syncStatus: EventSyncStatus.CREATED,
      date: '2023-02-02',
    });
    expect(handleSectionPlanningChangeFn).toBeCalled();
  });
});
