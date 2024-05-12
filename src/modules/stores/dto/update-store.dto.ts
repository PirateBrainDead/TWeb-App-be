import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl, IsUUID, ValidateIf } from 'class-validator';
import { ToBoolean } from '../../../shared/decorators/validators/to-boolean.decorator';

export class UpdateStoreDto {
  @ApiProperty({ required: false, example: 'https://example.com' })
  @ValidateIf((store) => store.leafletLink === undefined || store.leafletLink.length)
  @IsUrl()
  leafletLink: string;
}

export class StoreActivationDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID(4)
  id: string;

  @ApiProperty({ required: true })
  @ToBoolean()
  activate: boolean;
}
