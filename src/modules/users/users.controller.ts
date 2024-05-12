import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiChangePassword, ApiIsPasswordChanged } from './users.swagger';
import { HasRoles } from '../../shared/decorators/roles/has-roles.decorator';
import { Role } from './entities/role.enum';
import { UsersService } from './services/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DateQuery } from './dto/query-users.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiChangePassword()
  @Patch('change-password')
  @HasRoles(Role.Manager)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto): Promise<boolean> {
    return await this.usersService.changePassword(changePasswordDto);
  }
}
