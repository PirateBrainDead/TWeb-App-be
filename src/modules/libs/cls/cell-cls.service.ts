import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { CellClsStore, LoggedInUser } from '../../auth/dto/jwt-payload.dto';

@Injectable()
export class CellClsService {
  constructor(private readonly cls: ClsService<CellClsStore>) {}

  get userId(): string {
    return this.cls.get('userId');
  }

  get storeId(): string {
    return this.cls.get('userStoreId');
  }

  setStoreInfo(currentUser?: LoggedInUser): void {
    if (!currentUser) return; // Unauthorized routes

    const { userId, storeId } = currentUser;
    this.cls.set('userId', userId);
    this.cls.set('userStoreId', storeId);
  }
}
