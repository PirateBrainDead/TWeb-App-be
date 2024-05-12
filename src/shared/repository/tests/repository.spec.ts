import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../../../modules/libs/redis/redis.service';
import { Repository } from '../repository.service';
import { savedTasksMock, storeIdMock } from '../../../modules/tasks/tests/__mocks__/tasks.mocks';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../../../modules/tasks/entity/task.entity';

describe('Repository', () => {
  let repository: Repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Repository,
        {
          provide: RedisService,
          useValue: {
            get: async () => jest.fn(),
            mget: async () => jest.fn(),
            set: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<Repository>(Repository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
  describe('FindAll', () => {
    it('should return data', async () => {
      jest.spyOn(repository['db'], 'get').mockResolvedValue([]);
      expect(await repository.findAll(storeIdMock)).toEqual([]);
    });
    it('should return empty data by storeId', async () => {
      jest.spyOn(repository['db'], 'get').mockResolvedValue(null);
      expect(await repository.findAll('')).toEqual([]);
    });
  });
  describe('FindMany', () => {
    it('should return many data', async () => {
      jest.spyOn(repository['db'], 'mget').mockResolvedValue([savedTasksMock]);
      expect(await repository.findMany(...[])).toEqual([savedTasksMock]);
    });
  });
  describe('FindOne', () => {
    it('should return one by id', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([...savedTasksMock]);

      const item = await repository.findOne(storeIdMock, savedTasksMock[0].id);

      expect(item).toEqual(savedTasksMock[0]);
    });
    it('should return undefined', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([]);

      const item = await repository.findOne(storeIdMock, savedTasksMock[0].id);

      expect(item).toEqual(undefined);
    });
  });
  describe('Upsert', () => {
    it('should upsert be called with params', async () => {
      jest.spyOn(repository['db'], 'set');
      const upsertFn = jest.spyOn(repository, 'upsert');
      await repository.upsert('key', savedTasksMock);
      expect(upsertFn).toBeCalled();
    });
  });
  describe('Create', () => {
    it('should create new', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([...savedTasksMock]);
      const setFn = jest.spyOn(repository['db'], 'set');

      const newTask = { ...savedTasksMock[0], id: uuidv4() };
      await repository.create('key', newTask);

      expect(setFn).toBeCalledWith('key', [...savedTasksMock, newTask]);
    });
    it('should create one new', async () => {
      const setFn = jest.spyOn(repository['db'], 'set');
      const newTask = { ...savedTasksMock[0] };
      await repository.createOne('key', newTask);
      expect(setFn).toBeCalledWith('key', newTask);
    });
  });
  describe('CreateMany', () => {
    it('should create many new', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([...savedTasksMock]);
      const setFn = jest.spyOn(repository['db'], 'set');

      const newTask = { ...savedTasksMock[0], id: uuidv4() };
      const newSecondTask = { ...savedTasksMock[0], id: uuidv4() };
      await repository.createMany('key', [newTask, newSecondTask]);

      expect(setFn).toBeCalledWith('key', [...savedTasksMock, newTask, newSecondTask]);
    });
  });
  describe('Update', () => {
    it('should update existing by id', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([...savedTasksMock]);
      const setFn = jest.spyOn(repository['db'], 'set');

      const existingToUpdate = { ...savedTasksMock[0], name: 'Updated name' } as Task;
      await repository.update('key', existingToUpdate);

      expect(setFn).toBeCalledWith('key', [existingToUpdate]);
    });
    it('should not update - non-existing id', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([...savedTasksMock]);
      const setFn = jest.spyOn(repository['db'], 'set');

      const existingToUpdate = { ...savedTasksMock[0], id: uuidv4() } as Task;
      await repository.update('key', existingToUpdate);

      expect(setFn).toBeCalledWith('key', savedTasksMock);
    });
  });
  describe('Delete', () => {
    it('should delete by id', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([...savedTasksMock]);
      const setFn = jest.spyOn(repository['db'], 'set');

      await repository.delete('key', savedTasksMock[0].id);

      expect(setFn).toBeCalledWith('key', []);
    });
    it('should not delete - non-existing id', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([...savedTasksMock]);
      const setFn = jest.spyOn(repository['db'], 'set');

      await repository.delete('key', uuidv4());

      expect(setFn).toBeCalledWith('key', savedTasksMock);
    });
  });
});
