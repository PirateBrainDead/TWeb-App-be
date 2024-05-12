import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { METADATA_KEYS } from '../constants/metadata.keys';
import { RequestWithUser } from '../../modules/auth/dto/request-with-user.interface';

@Injectable()
export class RoleGuard extends JwtAuthGuard {
  constructor(protected reflector: Reflector) {
    super(reflector);
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const canActivate = Promise.resolve(super.canActivate(context));
    return canActivate.then((value) => {
      if (!value) return false;

      const roles = this.reflector.get<string[]>(METADATA_KEYS.ROLES.ROLES, context.getHandler());
      if (!roles) return true;

      const user = context.switchToHttp().getRequest<RequestWithUser>().user;

      return roles.includes(user?.role);
    });
  }
}
