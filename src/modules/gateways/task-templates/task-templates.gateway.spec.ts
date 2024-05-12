import { Test, TestingModule } from '@nestjs/testing';
import { SocketModule } from '@nestjs/websockets/socket-module';
import { Server } from 'socket.io';
import { EventSyncStatus } from '../../tasks/dto/tasks.event';
import { TaskTemplatesGateway } from './task-templates.gateway';
import { savedTaskTemplateMock } from '../../task-templates/tests/__mocks__/task-templates.mocks';
import { loggedInUserMock } from '../../users/tests/__mocks__/users.mock';

describe('TaskTemplatesGateway', () => {
  const websocketServer: Server = new Server(85, { transports: ['websocket'] });
  let service: TaskTemplatesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SocketModule],
      providers: [TaskTemplatesGateway],
    }).compile();

    service = module.get<TaskTemplatesGateway>(TaskTemplatesGateway);
    service['server'] = websocketServer;
  });
  afterEach(() => {
    websocketServer.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should call handleTaskTemplatesChanges', () => {
    jest.spyOn(service['server'], 'emit');
    const handleTaskTemplatesChangesFn = jest.spyOn(service, 'handleTaskTemplatesChanges');
    service.handleTaskTemplatesChanges({
      userId: loggedInUserMock.userId,
      taskTemplates: savedTaskTemplateMock,
      syncStatus: EventSyncStatus.CREATED,
    });
    expect(handleTaskTemplatesChangesFn).toBeCalled();
  });
});
