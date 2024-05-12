import { LoggedInUser } from '../../../auth/dto/jwt-payload.dto';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.enum';

export const lastPasswordChangedDate = '2023-02-02 10:10:10';
export const roleMock = Role.HQ;

export const loggedInUserMock = {
  userId: '25b4b9f7-80f4-4317-8b6f-d5ab5ad72f60',
  storeId: 'ce3a4574-38b1-4d8b-8918-3dcce2a80520',
  username: 'managerapp',
  role: Role.Manager,
} as LoggedInUser;

export const loggedInSuperAdminMock = {
  userId: '25b4b9f7-80f4-4317-8b6f-d5ab5ad72f60',
  username: 'administrator',
  role: Role.SuperAdmin,
} as LoggedInUser;

export const usersMock = [
  {
    id: '25b4b9f7-80f4-4317-8b6f-d5ab5ad72f60',
    username: 'managerapp',
    role: Role.Manager,
    lastPasswordChangedDate: lastPasswordChangedDate,
    password: '$2a$10$iLCK/QHX7ckN4fUeLz0b6.WD.ZDWoppb58/YnI.WSXQpns7ZwTTF6', // test123
    deviceTokens: [
      { deviceType: 'ios', deviceToken: 'token1' },
      { deviceType: 'android', deviceToken: 'token2' },
    ],
  },
  {
    id: '25b4b9f7-80f4-4317-8b6f-d5ab5ad72f60',
    username: 'hqapp',
    role: Role.HQ,
    lastPasswordChangedDate: lastPasswordChangedDate,
    password: '$2a$10$iLCK/QHX7ckN4fUeLz0b6.WD.ZDWoppb58/YnI.WSXQpns7ZwTTF6', // test123
  },
] as User[];

export const updateUserMock: User = {
  id: '25b4b9f7-80f4-4317-8b6f-d5ab5ad72f60',
  username: 'managerapp',
  role: Role.Manager,
  lastPasswordChangedDate: lastPasswordChangedDate,
  password: '$2a$10$iLCK/QHX7ckN4fUeLz0b6.WD.ZDWoppb58/YnI.WSXQpns7ZwTTF6', // test123
};

export const userDeviceTokensMock = [
  {
    id: '25b4b9f7-80f4-4317-8b6f-d5ab5ad72f60',
    username: 'managerapp',
    role: Role.Manager,
    lastPasswordChangedDate: lastPasswordChangedDate,
    password: '$2a$10$iLCK/QHX7ckN4fUeLz0b6.WD.ZDWoppb58/YnI.WSXQpns7ZwTTF6',

    deviceTokens: [
      {
        deviceToken: [
          'GKqSFoVSQS0nZICF6MFiB:APA91bGtWkwdYFY-QaE7K9x1akMThyP584Af-EB09GA5OOu7rwNWrCybeh1CEDbqAJOFsdv41_AEHvUTwpNE-2XNEYC8JcFIabzAW8ON9jXYnMMohv6OHEId7PMhYwRX51gsCKw9_FJM',
        ],
        deviceType: 'android',
      },
    ],
  },
  {
    id: '25b4b9f7-80f4-4317-8b6f-d5ab5ad72f60',
    username: 'hqapp',
    role: Role.HQ,
    lastPasswordChangedDate: lastPasswordChangedDate,
    password: '$2a$10$iLCK/QHX7ckN4fUeLz0b6.WD.ZDWoppb58/YnI.WSXQpns7ZwTTF6',
    deviceTokens: [
      {
        deviceToken: [
          'GKqSFoVSQS0nZICF6MFiB:APA91bGtWkwdYFY-QaE7K9x1akMThyP584Af-EB09GA5OOu7rwNWrCybeh1CEDbqAJOFsdv41_AEHvUTwpNE-2XNEYC8JcFIabzAW8ON9jXYnMMohv6OHEId7PMhYwRX51gsCKw9_FJM',
        ],
        deviceType: 'android',
      },
    ],
  },
] as User[];
