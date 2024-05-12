import { Role } from '../../users/entities/role.enum';
import { ClsStore } from 'nestjs-cls';

export class JwtPayload {
  userId: string;
  username: string;
  storeId: string;
  role: Role;
}

export type LoggedInUser = JwtPayload;

export interface CellClsStore extends ClsStore {
  userId: string;
  userStoreId: string;
}
