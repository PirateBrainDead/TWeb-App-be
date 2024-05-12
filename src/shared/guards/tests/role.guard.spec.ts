import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RoleGuard } from '../role.guard';
import { Role } from '../../../modules/users/entities/role.enum';
import { loggedInUserMock } from '../../../modules/users/tests/__mocks__/users.mock';
import { RequestWithUser } from '../../../modules/auth/dto/request-with-user.interface';

const mockLoggedInRequest = {
  user: loggedInUserMock,
} as RequestWithUser;

const ctxMock = {
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({
    getRequest: () => mockLoggedInRequest,
    getResponse: () => ({}),
  }),
} as ExecutionContext;

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RoleGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true for loggedInUser with right role', async () => {
    reflector.get = jest.fn().mockReturnValue([Role.Manager, Role.HQ]);
    const canActivate = Promise.resolve(guard.canActivate(ctxMock));

    expect(await canActivate).toBe(true);
  });
  it('should return false for loggedInUser with bad role', async () => {
    reflector.get = jest.fn().mockReturnValue([Role.HQ]);
    const canActivate = Promise.resolve(guard.canActivate(ctxMock));

    expect(await canActivate).toBe(false);
  });
});
