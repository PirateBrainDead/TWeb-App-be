import { DeviceToken } from '../../../../modules/users/entities/user.entity';
import { UpdateDeviceTokenDto } from '../../dto/update-token.dto';

export const updateDeviceTokenMockDto = {
  deviceToken: '8e9f8954-0928-43b4-bd14-c095216ea52e',
  deviceType: 'ios',
} as UpdateDeviceTokenDto;

export const deviceTokenMock: DeviceToken[] = [
  {
    deviceToken: ['8e9f8954-0928-43b4-bd14-c095216ea52e'],
    deviceType: 'ios',
  },
];
