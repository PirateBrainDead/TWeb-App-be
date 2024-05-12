import { RedisService } from './redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

const dummy: { name: string } = {
  name: 'text',
};

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'test'),
            mget: jest.fn(() => 'test'),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should get return parsed value', async () => {
    jest.spyOn(service['redis'], 'get').mockResolvedValue(JSON.stringify(dummy));
    expect(await service.get<{ name: string }>('key')).toEqual(dummy);
  });
  it('should get return parsed value', async () => {
    jest.spyOn(service['redis'], 'mget').mockResolvedValue([JSON.stringify(dummy), null]);
    expect(await service.mget('key', 'key2')).toEqual([dummy, null]);
  });
  it('should set be called with params', async () => {
    const setFn = jest.spyOn(service['redis'], 'set').mockResolvedValue('OK');
    await service.set('key', dummy);
    expect(setFn).toBeCalledWith('key', JSON.stringify(dummy));
  });
  it('should reset be called', async () => {
    const flushDb = jest.spyOn(service['redis'], 'flushdb').mockResolvedValue('OK');
    await service.reset();
    expect(flushDb).toBeCalled();
  });
});
