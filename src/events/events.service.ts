import { Injectable, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import {
  EVENT_HANDLERS_SERVICE,
  IEventHandlersService,
  IEventService,
} from './interfaces';
import { ConfigService } from '@nestjs/config';
import { generateWorklogReport } from 'helpers/daily-worklog-report';

@Injectable()
export class EventsService implements IEventService {
  request: (data?: any) => Promise<any>;
  constructor(
    @Inject(EVENT_HANDLERS_SERVICE)
    private readonly eventHandlerService: IEventHandlersService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.request = (data) =>
      this.httpService.axiosRef.post(
        this.configService.get<string>('GOOGLE_CHAT_WEBHOOK'),
        data,
      );
  }

  public async sendDailyWorklogSummary(date?: string) {
    try {
      const data = await this.eventHandlerService.dailyWorklogReport(date);

      await this.request(generateWorklogReport(data, date));

      return generateWorklogReport(data, date);
    } catch (error) {
      console.error('Error when send report to Google Chat:', error);
      throw error;
    }
  }

  // Run at 20h30 everyday in Week
  @Cron('28 13 * * 1-5', {
    name: 'daily_report_worklog',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async dailyReportWorklog() {
    const today = dayjs().format('DD/MM/YYYY');
    Logger.log(` - Create worklog-report daily (${today})`);
    try {
      Logger.log('Run');
      // return this.sendDailyWorklogSummary(today);
    } catch (error) {
      console.error("Error when run cron 'Daily Report Worklog':", error);
      throw error;
    }
  }
}
