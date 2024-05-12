import { Test, TestingModule } from '@nestjs/testing';
import { lastPasswordChangedDate, loggedInUserMock, usersMock } from './__mocks__/users.mock';
import { UsersValidationService } from '../services/users-validation.service';
import { UsersService } from '../services/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import { DATETIME_FORMAT } from '../../../shared/constants/date.constants';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { UsersRepository } from '../users.repository';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersValidationService,
        EventEmitter2,
        {
          provide: UsersRepository,
          useValue: {
            findById: async () => jest.fn(),
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

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('ChangePassword', () => {
    it('should change users password', async () => {
      jest.spyOn(service['usersRepository'], 'findById').mockResolvedValue({ ...usersMock[0] });
      const updateFn = jest.spyOn(service['usersRepository'], 'update');

      const response = await service.changePassword({
        oldPassword: 'test123',
        newPassword: 'test12345',
        newRepeatPassword: 'test123456',
      });

      expect(updateFn).toBeCalled();
      expect(response).toBeTruthy();
    });
  });
  describe('IsPasswordChanged', () => {
    it('should return true if user password is changed since lastLogin date', async () => {
      jest.spyOn(service['usersRepository'], 'findById').mockResolvedValue({ ...usersMock[0] });

      const lastLoginDate = dayjs(lastPasswordChangedDate).subtract(1, 'day').format(DATETIME_FORMAT);
      const response = await service.isPasswordChanged(lastLoginDate);

      expect(response).toBeTruthy();
    });
    it('should return false if user password is not changed since lastLogin date', async () => {
      jest.spyOn(service['usersRepository'], 'findById').mockResolvedValue({ ...usersMock[0] });

      const lastLoginDate = dayjs(lastPasswordChangedDate).add(1, 'day').format(DATETIME_FORMAT);
      const response = await service.isPasswordChanged(lastLoginDate);

      expect(response).not.toBeTruthy();
    });
  });
});
