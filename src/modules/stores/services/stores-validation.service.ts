import { BadRequestException, Injectable } from '@nestjs/common';
import { Store } from '../entity/store.entity';
import { Errors } from '../../../shared/constants/errors.constants';

@Injectable()
export class StoresValidationService {
  validateUniqueStoreName(newStoreName: string, stores: Store[]): void {
    if (stores.some((a) => a.name.toLowerCase() === newStoreName.toLowerCase()))
      throw new BadRequestException(Errors.StoreNameUnique);
  }

  validateActiveStore(store: Store): void {
    if (!store.active) throw new BadRequestException(Errors.StoreDeactivated);
  }
}
