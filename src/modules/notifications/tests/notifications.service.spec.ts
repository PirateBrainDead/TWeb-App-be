import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { UsersRepository } from '../../users/users.repository';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { loggedInUserMock, usersMock } from '../../users/tests/__mocks__/users.mock';
import { deviceTokenMock, updateDeviceTokenMockDto } from './__mocks__/notifications.mocks';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: UsersRepository,
          useValue: {
            findById: async () => jest.fn(),
            findAllDeviceTokensFromStore: async () => jest.fn(),
            update: async () => jest.fn(),
          },
        },
        {
          provide: CellClsService,
          useValue: {
            storeId: loggedInUserMock.storeId,
            userId: loggedInUserMock.userId,
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call finById and update device token', async () => {
    jest.spyOn(service['usersRepository'], 'findById').mockResolvedValue(usersMock[0]);
    const updateFn = jest.spyOn(service['usersRepository'], 'update');
    const isUpdated = await service.updateDeviceToken(updateDeviceTokenMockDto);
    expect(updateFn).toBeCalled();
    expect(isUpdated).toBeTruthy();
  });

  it('should send to multiple devices', async () => {
    jest.spyOn(service['usersRepository'], 'findAllDeviceTokensFromStore').mockResolvedValue(deviceTokenMock);
    const updateFn = jest.spyOn(service, 'sendMulticast').mockResolvedValue({
      responses: [{ success: true }],
      successCount: 1,
      failureCount: 0,
    });
    const isUpdated = await service.sendNotificationsToHq({ title: 'test', body: 'body' });
    expect(updateFn).toBeCalled();
    expect(isUpdated).toBeTruthy();
  });
});
