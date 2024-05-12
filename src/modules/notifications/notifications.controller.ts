import { Body, Controller, Put } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UpdateDeviceTokenDto } from './dto/update-token.dto';
import { HasRoles } from '../../shared/decorators/roles/has-roles.decorator';
import { Role } from '../users/entities/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiRemoveDeviceToken, ApiUpdateDeviceToken } from './notifications.swagger';

@ApiBearerAuth()
@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @ApiUpdateDeviceToken()
  @HasRoles(Role.HQ)
  @Put('update')
  async update(@Body() updateDeviceTokenDto: UpdateDeviceTokenDto): Promise<boolean> {
    return await this.notificationService.updateDeviceToken(updateDeviceTokenDto);
  }

  @ApiRemoveDeviceToken()
  @HasRoles(Role.HQ)
  @Put('remove')
  async remove(@Body() updateDeviceTokenDto: UpdateDeviceTokenDto): Promise<boolean> {
    return await this.notificationService.removeDeviceToken(updateDeviceTokenDto);
  }
}
