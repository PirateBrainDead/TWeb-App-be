import { Test, TestingModule } from '@nestjs/testing';
import { SocketModule } from '@nestjs/websockets/socket-module';
import { Server } from 'socket.io';
import { savedRepeatableTasksMock } from '../../tasks/tests/__mocks__/tasks.mocks';
import { EventSyncStatus } from '../../tasks/dto/tasks.event';
import { TasksGateway } from './tasks.gateway';

describe('TasksGateway', () => {
  const websocketServer: Server = new Server(85, { transports: ['websocket'] });
  let service: TasksGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SocketModule],
      providers: [TasksGateway],
    }).compile();

    service = module.get<TasksGateway>(TasksGateway);
    service['server'] = websocketServer;
  });
  afterEach(() => {
    websocketServer.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should call handleDailyTasksChanges', () => {
    jest.spyOn(service['server'], 'emit');
    const handleDailyTasksChangesFn = jest.spyOn(service, 'handleDailyTasksChanges');
    service.handleDailyTasksChanges({ storeId: '', tasks: [], syncStatus: EventSyncStatus.CREATED });
    expect(handleDailyTasksChangesFn).toBeCalled();
  });
  it('should call handleRepeatableTasksChanges', () => {
    jest.spyOn(service['server'], 'emit');
    const handleRepeatableTasksChangesFn = jest.spyOn(service, 'handleRepeatableTasksChanges');
    service.handleRepeatableTasksChanges({
      storeId: '',
      tasks: savedRepeatableTasksMock,
      syncStatus: EventSyncStatus.CREATED,
    });
    expect(handleRepeatableTasksChangesFn).toBeCalled();
  });
});
