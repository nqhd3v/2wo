import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JiraService } from './jira.service';
import { JIRA_SERVICE } from './interfaces';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { JIRA_HANDLERS_SERVICE } from './interfaces/jira-handler.service.interface';
import { JiraHandlersService } from './jira-handler.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        BASE_JIRA_API: Joi.string().required(),
        JIRA_BOARD_NAME_FILTER: Joi.string().required(),
        WORKER_JR_USERNAME: Joi.string().required(),
        WORKER_JR_PASSWORD: Joi.string().required(),
        WORKER_JR_BOARD_ID: Joi.number().required(),
      }),
    }),
  ],
  providers: [
    {
      provide: JIRA_SERVICE,
      useClass: JiraService,
    },
    {
      provide: JIRA_HANDLERS_SERVICE,
      useClass: JiraHandlersService,
    },
  ],
  exports: [JIRA_SERVICE, JIRA_HANDLERS_SERVICE],
})
export class JiraModule {}
