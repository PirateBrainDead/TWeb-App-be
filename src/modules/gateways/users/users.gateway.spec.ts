import { Test, TestingModule } from '@nestjs/testing';
import { SocketModule } from '@nestjs/websockets/socket-module';
import { Server } from 'socket.io';
import { storeIdMock } from '../../tasks/tests/__mocks__/tasks.mocks';
import { loggedInUserMock } from '../../users/tests/__mocks__/users.mock';
import { dateNowFormatted } from '../../../shared/utils/date.utils';
import { UsersGateway } from './users.gateway';

describe('UsersGateway', () => {
  const websocketServer: Server = new Server(85, { transports: ['websocket'] });
  let service: UsersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SocketModule],
      providers: [UsersGateway],
    }).compile();

    service = module.get<UsersGateway>(UsersGateway);
    service['server'] = websocketServer;
  });
  afterEach(() => {
    websocketServer.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should call handleUserPasswordChange', () => {
    jest.spyOn(service['server'], 'emit');
    const handlePasswordChangeFn = jest.spyOn(service, 'handlePasswordChange');
    service.handlePasswordChange({
      storeId: storeIdMock,
      userId: loggedInUserMock.userId,
      passwordChangedAt: dateNowFormatted(),
    });
    expect(handlePasswordChangeFn).toBeCalled();
  });
});
