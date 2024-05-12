import { Role } from './role.enum';
import { dateNowFormatted } from '../../../shared/utils/date.utils';
import { DATETIME_FORMAT } from '../../../shared/constants/date.constants';
import { hash } from 'bcrypt';

export type User = {
  id: string;
  username: string;
  password: string;
  lastPasswordChangedDate: string; // YYYY-MM-DD HH-mm-ss
  role: Role;
  deviceTokens?: DeviceToken[];
};

export type DeviceToken = {
  deviceToken: string[];
  deviceType: string;
};

export const createNewUser = async (username: string, password: string, role: Role): Promise<Omit<User, 'id'>> => {
  const dateTimeNow = dateNowFormatted(DATETIME_FORMAT);
  const hashedPassword = await hash(password, 10);

  return { username, role, password: hashedPassword, lastPasswordChangedDate: dateTimeNow };
};
