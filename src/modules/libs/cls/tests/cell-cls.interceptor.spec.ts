import { CellClsInterceptor } from '../cell-cls.interceptor';
import { CellClsService } from '../cell-cls.service';
import { ClsServiceManager } from 'nestjs-cls';
import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { loggedInUserMock } from '../../../users/tests/__mocks__/users.mock';

const ctxMock = {
  switchToHttp: () => ({
    getRequest: () => ({ user: loggedInUserMock }),
  }),
} as ExecutionContext;

describe('CellClsInterceptor', () => {
  let interceptor: CellClsInterceptor;
  let cls: CellClsService;

  beforeEach(() => {
    cls = new CellClsService(ClsServiceManager.getClsService());
    interceptor = new CellClsInterceptor(cls);
  });

  it('should intercept and setStoreInfo on the CLS context', async () => {
    await ClsServiceManager.getClsService().run(async () => {
      const setStoreInfoFn = jest.spyOn(cls, 'setStoreInfo');

      interceptor.intercept(ctxMock, { handle: () => of({ user: loggedInUserMock }) });

      expect(setStoreInfoFn).toBeCalledWith(loggedInUserMock);
    });
  });
});
