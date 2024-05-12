import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LoggerService, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GlobalExceptionFilter } from './shared/filters/global-exception/global-exception.filter';
import { ConfigService } from '@nestjs/config';

import { AppConfig } from './config/config.types';
import { RoleGuard } from './shared/guards/role.guard';
import { WinstonModule } from 'nest-winston';
import winston, { transports } from 'winston';
import dayjs from 'dayjs';
import { DATE_FORMAT, DATETIME_FORMAT } from './shared/constants/date.constants';

let app: NestExpressApplication;

const loggerSettings: { logger: LoggerService } = {
  logger: WinstonModule.createLogger({
    transports: [
      new winston.transports.File({
        filename: `logs/errors-${dayjs().format(DATE_FORMAT)}.log`,
        level: 'error',
      }),
    ],
    exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
    format: winston.format.combine(
      winston.format.timestamp({ format: DATETIME_FORMAT }),
      winston.format.printf((info) => {
        return `${info.timestamp} [${info.level}] [${info.context ? info.context : info.stack}] ${info.message}`;
      }),
    ),
  }),
};

const setupSwagger = () => {
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('Task Management API documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
};

const bootstrap = async () => {
  app = await NestFactory.create(AppModule);

  app.useLogger(loggerSettings.logger);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalGuards(new RoleGuard(app.get(Reflector)));
  setupSwagger();
  const config = app.get(ConfigService);
  const { port } = config.get<AppConfig>('app');

  // Start App
  await app.listen(port, () =>
    Logger.log(
      `
      =====================================================================================
      -> NestJS server is running on port ${port} 🏃
      =====================================================================================
      `,
    ),
  );
};
bootstrap();

process.on('SIGINT', () => {
  Logger.log('Server stopped');
  app.close();
});
