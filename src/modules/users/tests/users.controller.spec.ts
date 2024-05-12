import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../services/users.service';
import { lastPasswordChangedDate } from './__mocks__/users.mock';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            changePassword: () => jest.fn(),
            isPasswordChanged: () => jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
    usersService = app.get<UsersService>(UsersService);
  });

  it('should call changePassword', async () => {
    const changePasswordFn = jest.spyOn(usersService, 'changePassword');
    await usersController.changePassword({
      oldPassword: 'test1234',
      newPassword: '12345678',
      newRepeatPassword: '12345678',
    });
    expect(changePasswordFn).toBeCalled();
  });

  it('should call isPasswordChanged', async () => {
    const isPasswordChangedFn = jest.spyOn(usersService, 'isPasswordChanged');
    await usersController.isPasswordChanged({ date: lastPasswordChangedDate });
    expect(isPasswordChangedFn).toBeCalled();
  });
});
