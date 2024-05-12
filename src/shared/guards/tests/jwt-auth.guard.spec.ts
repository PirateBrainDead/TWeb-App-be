import { JwtAuthGuard } from '../jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

const ctxMock = {
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({
    getRequest: () => ({
      url: 'some url path',
    }),
    getResponse: () => ({}),
  }),
} as ExecutionContext;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true on ANONYMOUS routes', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
    const canActivate = guard.canActivate(ctxMock);

    expect(canActivate).toBe(true);
  });
});
