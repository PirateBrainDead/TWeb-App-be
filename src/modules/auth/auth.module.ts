import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from '../../config/config.types';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { Repository } from '../../shared/repository/repository.service';
import { AuthController } from './auth.controller';
import { UsersValidationService } from '../users/services/users-validation.service';
import { UsersRepository } from '../users/users.repository';
import { StoresRepository } from '../stores/stores.repository';
import { StoresValidationService } from '../stores/services/stores-validation.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const { secret, expiresIn } = configService.get<JwtConfig>('jwt');
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    UsersValidationService,
    StoresValidationService,
    JwtStrategy,
    Repository,
    UsersRepository,
    StoresRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
