import { Test, TestingModule } from '@nestjs/testing';
import { loggedInUserMock, usersMock } from '../../users/tests/__mocks__/users.mock';
import { JwtStrategy } from '../jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../../users/users.repository';
import { StoresRepository } from '../../stores/stores.repository';
import { StoresValidationService } from '../../stores/services/stores-validation.service';
import { storesMock } from '../../stores/tests/__mocks__/stores.mock';

describe('JwtStrategy', () => {
  let service: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        StoresValidationService,
        {
          provide: ConfigService,
          useValue: {
            get: () => {
              return { secret: 'jwtSecret' };
            },
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findById: async () => jest.fn(),
          },
        },
        {
          provide: StoresRepository,
          useValue: {
            findById: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('Validate', () => {
    it('should find and return loggedInUser', async () => {
      jest.spyOn(service['usersRepository'], 'findById').mockResolvedValue({ ...usersMock[0] });
      jest.spyOn(service['storesRepository'], 'findById').mockResolvedValue({ ...storesMock[0] });

      const response = await service.validate(loggedInUserMock);

      expect(response).toEqual(loggedInUserMock);
    });
    it(`should throw UnauthorizedException User doesn't exist`, async () => {
      jest.spyOn(service['usersRepository'], 'findById').mockResolvedValue(undefined);
      jest.spyOn(service['storesRepository'], 'findById').mockResolvedValue({ ...storesMock[0] });

      try {
        await service.validate(loggedInUserMock);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });
});
