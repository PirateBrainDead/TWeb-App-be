import { LoggedInUser } from './jwt-payload.dto';

export class RequestWithUser extends Request {
  user: LoggedInUser;
}
