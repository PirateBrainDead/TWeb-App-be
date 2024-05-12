import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: () => jest.fn(),
          },
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
  });

  it('should call login - managerApp', async () => {
    const loginFn = jest.spyOn(authService, 'login');
    await authController.loginManagerApp({ username: 'test', password: '12345678' });
    expect(loginFn).toBeCalled();
  });
  it('should call login - hqapp', async () => {
    const loginFn = jest.spyOn(authService, 'login');
    await authController.loginHQApp({ username: 'test', password: '12345678' });
    expect(loginFn).toBeCalled();
  });
  it('should call login - admin', async () => {
    const loginFn = jest.spyOn(authService, 'login');
    await authController.loginBackoffice({ username: 'test', password: '12345678' });
    expect(loginFn).toBeCalled();
  });
});
