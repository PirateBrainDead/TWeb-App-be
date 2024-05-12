import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from '../../config/config.types';
import { JwtPayload, LoggedInUser } from './dto/jwt-payload.dto';
import { UsersRepository } from '../users/users.repository';
import { StoresRepository } from '../stores/stores.repository';
import { StoresValidationService } from '../stores/services/stores-validation.service';
import { Role } from '../users/entities/role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly storesRepository: StoresRepository,
    private readonly storesValidationService: StoresValidationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<JwtConfig>('jwt').secret,
    });
  }

  async validate(payload: JwtPayload): Promise<LoggedInUser> {
    const user = await this.usersRepository.findById(payload.userId, payload.storeId);
    if (!user) throw new UnauthorizedException();
    if (user.role !== Role.SuperAdmin) {
      const store = await this.storesRepository.findById(payload.storeId);
      this.storesValidationService.validateActiveStore(store);
    }

    return { userId: user.id, username: user.username, role: user.role, storeId: payload.storeId };
  }
}
