import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { WorkersModule } from './workers/workers.module';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { JiraModule } from './jira/jira.module';
import * as Joi from 'joi';

@Module({
  imports: [
    WorkersModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
      }),
    }),
    EventsModule,
    JiraModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
