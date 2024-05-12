import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { METADATA_KEYS } from '../constants/metadata.keys';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(protected reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const anonymous = this.reflector.getAllAndOverride<boolean>(METADATA_KEYS.ANONYMOUS, [
      context.getHandler(),
      context.getClass(),
    ]);

    /* istanbul ignore next */
    return anonymous ? true : super.canActivate(context);
  }
}
