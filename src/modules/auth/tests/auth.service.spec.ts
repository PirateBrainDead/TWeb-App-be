import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import {
  loggedInSuperAdminMock,
  loggedInUserMock,
  usersMock,
  lastPasswordChangedDate,
} from '../../users/tests/__mocks__/users.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LoginResponse } from '../dto/login.dto';
import { UsersValidationService } from '../../users/services/users-validation.service';
import { Errors } from '../../../shared/constants/errors.constants';
import { Role } from '../../users/entities/role.enum';
import { UsersRepository } from '../../users/users.repository';
import { User } from '../../users/entities/user.entity';
import { StoresRepository } from '../../stores/stores.repository';
import { storesMock } from '../../stores/tests/__mocks__/stores.mock';
import { StoresValidationService } from '../../stores/services/stores-validation.service';
import MockDate from 'mockdate';

describe('AuthService', () => {
  let service: AuthService;

  afterEach(() => {
    MockDate.reset();
  });

  beforeEach(async () => {
    MockDate.set(lastPasswordChangedDate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersValidationService,
        StoresValidationService,
        {
          provide: StoresRepository,
          useValue: {
            findAll: async () => jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findByUsername: async () => jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('Login', () => {
    it('should return token after successful validation - managerApp', async () => {
      const jwt = 'token123445...';
      jest.spyOn(service, 'validateUser').mockResolvedValue(loggedInUserMock);
      jest.spyOn(service['jwtService'], 'signAsync').mockResolvedValue(jwt);

      const response = await service.login({ username: 'test', password: 'test123' }, Role.Manager);
      MockDate.set(lastPasswordChangedDate);
      expect(response).toEqual({
        token: jwt,
        user: loggedInUserMock,
        lastLoggedInTime: lastPasswordChangedDate,
      } as LoginResponse);
    });
    it('should return token after successful validation - hqApp', async () => {
      const jwt = 'token123445...';
      jest.spyOn(service, 'validateUser').mockResolvedValue(loggedInUserMock);
      jest.spyOn(service['jwtService'], 'signAsync').mockResolvedValue(jwt);

      const response = await service.login({ username: 'test', password: 'test123' }, Role.HQ);

      expect(response).toEqual({ token: jwt, user: loggedInUserMock } as LoginResponse);
    });
  });
  describe('ValidateUser', () => {
    it('should find and return user', async () => {
      jest.spyOn(service['storesRepository'], 'findAll').mockResolvedValue([...storesMock]);
      jest.spyOn(service['usersRepository'], 'findByUsername').mockResolvedValue({ ...usersMock[0] });

      const response = await service.validateUser(
        {
          username: loggedInUserMock.username,
          password: 'test123',
        },
        Role.Manager,
      );

      expect(response).toEqual(loggedInUserMock);
    });
    it('should find and return SuperAdmin', async () => {
      const superAdmin: User = { ...usersMock[0], role: Role.SuperAdmin, username: 'administrator' };
      jest.spyOn(service['usersRepository'], 'findByUsername').mockResolvedValue(superAdmin);

      const response = await service.validateUser(
        {
          username: loggedInSuperAdminMock.username,
          password: 'test123',
        },
        Role.SuperAdmin,
      );

      expect(response).toEqual(loggedInSuperAdminMock);
    });
    it('should throw NotFoundException for non-existing user', async () => {
      jest.spyOn(service['storesRepository'], 'findAll').mockResolvedValue([...storesMock]);
      jest.spyOn(service['usersRepository'], 'findByUsername').mockResolvedValue(undefined);

      try {
        await service.validateUser({ username: loggedInUserMock.username, password: 'test123' }, Role.Manager);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response.message).toEqual(Errors.UserNotFound);
      }
    });
    it('should throw BadRequestException for User with not acceptable role', async () => {
      jest.spyOn(service['storesRepository'], 'findAll').mockResolvedValue([...storesMock]);
      jest.spyOn(service['usersRepository'], 'findByUsername').mockResolvedValue({ ...usersMock[0] });

      try {
        await service.validateUser({ username: loggedInUserMock.username, password: 'test123' }, Role.HQ);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toEqual(Errors.UserNotAcceptableRole);
      }
    });
    it('should throw BadRequestException for incorrect old password', async () => {
      jest.spyOn(service['storesRepository'], 'findAll').mockResolvedValue([...storesMock]);
      jest.spyOn(service['usersRepository'], 'findByUsername').mockResolvedValue({ ...usersMock[0] });

      try {
        await service.validateUser({ username: loggedInUserMock.username, password: 'wrongpassword' }, Role.Manager);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toEqual(Errors.UserPasswordIncorrect);
      }
    });
  });
});
