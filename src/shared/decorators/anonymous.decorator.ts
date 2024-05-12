import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../constants/metadata.keys';

export const Anonymous = () => SetMetadata(METADATA_KEYS.ANONYMOUS, true);
