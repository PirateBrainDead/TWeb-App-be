import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { LoginDto, LoginResponse } from './dto/login.dto';
import { JwtPayload } from './dto/jwt-payload.dto';
import { UsersValidationService } from '../users/services/users-validation.service';
import { Role } from '../users/entities/role.enum';
import { UsersRepository } from '../users/users.repository';
import { StoresRepository } from '../stores/stores.repository';
import { StoresValidationService } from '../stores/services/stores-validation.service';
import dayjs from 'dayjs';
import { DATETIME_FORMAT_WITH_SECONDS } from '../../shared/constants/date.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersValidationService: UsersValidationService,
    private readonly storesValidationService: StoresValidationService,
    private readonly usersRepository: UsersRepository,
    private readonly storesRepository: StoresRepository,
  ) {}

  async login(loginDto: LoginDto, role: Role): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto, role);
    const token = await this.jwtService.signAsync(user);
    if (role === Role.Manager) {
      const lastLoggedInTime = dayjs().format(DATETIME_FORMAT_WITH_SECONDS);
      return { token, user, lastLoggedInTime } as LoginResponse;
    }

    return { token, user } as LoginResponse;
  }

  async validateUser(loginDto: LoginDto, role: Role): Promise<JwtPayload> {
    let user: User, storeId: string;
    if (role === Role.SuperAdmin) {
      user = await this.usersRepository.findByUsername(loginDto.username);
    } else {
      const stores = await this.storesRepository.findAll();
      for (const store of stores) {
        storeId = store.id;
        user = await this.usersRepository.findByUsername(loginDto.username, storeId);
        if (user) {
          this.storesValidationService.validateActiveStore(store);
          break;
        }
      }
    }

    this.usersValidationService.validateUserExists(user);
    this.usersValidationService.validateUserRole(user, role);
    await this.usersValidationService.validatePasswordMatching(loginDto.password, user.password);

    return { userId: user.id, username: user.username, storeId, role: user.role } as JwtPayload;
  }
}
