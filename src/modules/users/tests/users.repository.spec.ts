import { Test, TestingModule } from '@nestjs/testing';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { loggedInUserMock, roleMock, updateUserMock, userDeviceTokensMock, usersMock } from './__mocks__/users.mock';
import { UsersRepository } from '../users.repository';
import { Repository } from '../../../shared/repository/repository.service';
import { storeIdMock } from '../../tasks/tests/__mocks__/tasks.mocks';
import { storesMock } from '../../stores/tests/__mocks__/stores.mock';

describe('UsersRepository', () => {
  let service: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: Repository,
          useValue: {
            findAll: async () => jest.fn(),
            findMany: async () => jest.fn(),
            findOne: async () => jest.fn(),
            update: async () => jest.fn(),
          },
        },
        {
          provide: CellClsService,
          useValue: {
            storeId: loggedInUserMock.storeId,
          },
        },
      ],
    }).compile();

    service = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should findAll', async () => {
    const findAllFn = jest.spyOn(service['repository'], 'findAll').mockResolvedValue(usersMock);

    const users = await service.findAll();

    expect(findAllFn).toBeCalled();
    expect(users).toEqual(usersMock);
  });
  it('should findAllUsernamesFromStores', async () => {
    const findAllFn = jest.spyOn(service['repository'], 'findMany').mockResolvedValue([usersMock]);

    const allUsernames = await service.findAllUsernamesFromStores(storesMock);

    expect(findAllFn).toBeCalled();
    expect(allUsernames).toEqual(usersMock.map((a) => a.username));
  });
  it('should findById', async () => {
    const findByIdFn = jest.spyOn(service['repository'], 'findOne').mockResolvedValue(usersMock[0]);

    const user = await service.findById(usersMock[0].id);

    expect(findByIdFn).toBeCalled();
    expect(user).toEqual(usersMock[0]);
  });
  it('should findById - not logged in user', async () => {
    const findByIdFn = jest.spyOn(service['repository'], 'findOne').mockResolvedValue(usersMock[0]);

    const user = await service.findById(usersMock[0].id, storeIdMock);

    expect(findByIdFn).toBeCalled();
    expect(user).toEqual(usersMock[0]);
  });
  it('should findByUsername', async () => {
    const findByIdFn = jest.spyOn(service['repository'], 'findAll').mockResolvedValue(usersMock);

    const user = await service.findByUsername(usersMock[0].username, storeIdMock);

    expect(findByIdFn).toBeCalled();
    expect(user).toEqual(usersMock[0]);
  });
  it('should findByUsername - Admin', async () => {
    const findByIdFn = jest.spyOn(service['repository'], 'findAll').mockResolvedValue([]);

    const user = await service.findByUsername(usersMock[0].username);

    expect(findByIdFn).toBeCalled();
    expect(user).toEqual(undefined);
  });
  it('should update user', async () => {
    const updateFn = jest.spyOn(service, 'update');

    await service.update(updateUserMock);

    expect(updateFn).toBeCalled();
  });

  it('should findAllByRole', async () => {
    const findAllFn = jest.spyOn(service['repository'], 'findAll').mockResolvedValue(userDeviceTokensMock);

    const usersWithRole = await service.findAllByRole(roleMock, storeIdMock);

    expect(findAllFn).toBeCalled();
    expect(usersWithRole).toEqual(userDeviceTokensMock.filter((u) => u.role.toLowerCase() === roleMock.toLowerCase()));
  });

  it('should findAllDeviceTokensFromStore without role', async () => {
    const findAllFn = jest.spyOn(service['repository'], 'findAll').mockResolvedValue(userDeviceTokensMock);

    const userDeviceTokens = await service.findAllDeviceTokensFromStore(storeIdMock);

    expect(findAllFn).toBeCalled();
    expect(userDeviceTokens).toEqual(
      userDeviceTokensMock.filter((user) => user.deviceTokens).flatMap((user) => user.deviceTokens),
    );
  });

  it('should findAllDeviceTokensFromStore for hq', async () => {
    const findAllByRoleFn = jest.spyOn(service, 'findAllByRole').mockResolvedValue([userDeviceTokensMock[1]]);

    const userDeviceTokens = await service.findAllDeviceTokensFromStore(storeIdMock, roleMock);

    expect(findAllByRoleFn).toBeCalled();
    expect(userDeviceTokens).toEqual(
      [userDeviceTokensMock[1]].filter((user) => user.deviceTokens).flatMap((user) => user.deviceTokens),
    );
  });
});
