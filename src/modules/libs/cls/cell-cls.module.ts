import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { CellClsService } from './cell-cls.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CellClsInterceptor } from './cell-cls.interceptor';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
  providers: [
    CellClsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CellClsInterceptor,
    },
  ],
  exports: [CellClsService],
})
export class CellClsModule {}
