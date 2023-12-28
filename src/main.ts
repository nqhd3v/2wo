import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { formatErrors } from 'helpers/error.helper';
import { AppGuard } from './app/app.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { exposeDefaultValues: true },
      exceptionFactory: (errors: ValidationError[]) => {
        throw new BadRequestException(formatErrors(errors));
      },
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'https://*.nqhuy.dev'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  const port = config.get<string>('PORT') || 3001;
  await app.listen(port, () => Logger.log('Listening on ' + port));
}
bootstrap();
