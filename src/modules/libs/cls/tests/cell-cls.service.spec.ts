import { Test, TestingModule } from '@nestjs/testing';
import { CellClsService } from '../cell-cls.service';
import { ClsService } from 'nestjs-cls';
import { loggedInUserMock } from '../../../users/tests/__mocks__/users.mock';

describe('CellClsService', () => {
  let service: CellClsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CellClsService,
        {
          provide: ClsService,
          useValue: {
            get: () => jest.fn(),
            set: () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CellClsService>(CellClsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should get userId', () => {
    jest.spyOn(service['cls'], 'get').mockReturnValue(loggedInUserMock.userId);
    expect(service.userId).toEqual(loggedInUserMock.userId);
  });
  it('should get storeId', () => {
    jest.spyOn(service['cls'], 'get').mockReturnValue(loggedInUserMock.storeId);
    expect(service.storeId).toEqual(loggedInUserMock.storeId);
  });
  it('should set storeInfo', () => {
    const setFn = jest.spyOn(service['cls'], 'set');

    service.setStoreInfo(loggedInUserMock);

    expect(setFn).toBeCalledTimes(2);
    expect(setFn).toBeCalledWith('userId', loggedInUserMock.userId);
    expect(setFn).toBeCalledWith('userStoreId', loggedInUserMock.storeId);
  });
  it('should set empty storeInfo', () => {
    const setFn = jest.spyOn(service['cls'], 'set');

    service.setStoreInfo(undefined);

    expect(setFn).not.toBeCalled();
  });
});
