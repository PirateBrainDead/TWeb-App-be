import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Anonymous } from '../../shared/decorators/anonymous.decorator';
import { LoginDto, LoginResponse } from './dto/login.dto';
import { ApiManagerAppLogin } from './auth.swagger';
import { Role } from '../users/entities/role.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiManagerAppLogin()
  @Anonymous()
  @Post('login-manager-app')
  async loginManagerApp(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return await this.authService.login(loginDto, Role.Manager);
  }
}
