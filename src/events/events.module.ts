import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import * as Joi from 'joi';
import { JiraModule } from 'src/jira/jira.module';
import { EVENT_HANDLERS_SERVICE, EVENT_SERVICE } from './interfaces';
import { EventHandlersService } from './event-handler.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    HttpModule,
    JiraModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        GOOGLE_CHAT_WEBHOOK: Joi.string().required(),
      }),
    }),
  ],
  providers: [
    {
      provide: EVENT_SERVICE,
      useClass: EventsService,
    },
    {
      provide: EVENT_HANDLERS_SERVICE,
      useClass: EventHandlersService,
    },
  ],
  exports: [EVENT_SERVICE, EVENT_HANDLERS_SERVICE],
})
export class EventsModule {}
