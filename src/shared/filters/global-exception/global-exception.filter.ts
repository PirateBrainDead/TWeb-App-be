import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { isArray } from 'class-validator';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    Logger.error(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    /* istanbul ignore next */
    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // This handles exception messages from class-transformer
    /* istanbul ignore next */
    const errorMessage = exception['response']?.message;
    /* istanbul ignore next */
    if (isArray(errorMessage)) {
      exception.message = errorMessage.join(';');
    }
    const responseBody = {
      statusCode: httpStatus,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(httpStatus).json(responseBody);
  }
}
