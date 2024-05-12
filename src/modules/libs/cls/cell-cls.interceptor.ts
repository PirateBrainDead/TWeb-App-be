import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { CellClsService } from './cell-cls.service';
import { Observable } from 'rxjs';
import { RequestWithUser } from '../../auth/dto/request-with-user.interface';

@Injectable()
export class CellClsInterceptor implements NestInterceptor {
  constructor(private readonly cls: CellClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    this.cls.setStoreInfo(request.user);
    return next.handle();
  }
}
