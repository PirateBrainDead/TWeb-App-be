import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../notifications.controller';
import { NotificationsService } from '../notifications.service';
import { updateDeviceTokenMockDto } from './__mocks__/notifications.mocks';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            updateDeviceToken: () => jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationService = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', async () => {
    const updateDeviceTokenFn = jest.spyOn(notificationService, 'updateDeviceToken');
    const result = await controller.update(updateDeviceTokenMockDto);
    expect(updateDeviceTokenFn).toBeCalled();
    expect(result).toBeTruthy();
  });
});
