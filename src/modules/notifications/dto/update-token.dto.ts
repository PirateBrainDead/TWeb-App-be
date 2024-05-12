import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceType } from '../../users/entities/device-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDeviceTokenDto {
  @ApiProperty({ required: true })
  @IsString()
  deviceToken: string;

  @ApiProperty({ example: 'ios', required: true })
  @IsEnum(DeviceType)
  @IsNotEmpty()
  deviceType: DeviceType;
}
