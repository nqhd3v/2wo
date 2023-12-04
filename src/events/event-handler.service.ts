import { Injectable, Inject } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { IEventHandlersService } from './interfaces';
import {
  IJiraHandlersService,
  JIRA_HANDLERS_SERVICE,
  TSummaryWorklog,
} from 'src/jira/interfaces';

@Injectable()
export class EventHandlersService implements IEventHandlersService {
  constructor(
    @Inject(JIRA_HANDLERS_SERVICE)
    private readonly jiraHandlerService: IJiraHandlersService,
  ) {}

  public async dailyWorklogReport(date?: string): Promise<TSummaryWorklog[]> {
    const { worklogData } = await this.jiraHandlerService.summaryWorklog();
    try {
      const worklogDate = date || dayjs().format('DD/MM/YYYY');
      const worklogRecord = worklogData[worklogDate];
      if (!worklogRecord) {
        console.error('No worklogs found for', worklogDate);
        throw new Error('No worklogs found!');
      }

      return Object.values(worklogRecord);
    } catch (error) {
      console.error('Error when generate pre-data for Worker:', error);
      throw error;
    }
  }

  // public async weeklyWorklogReport(startDate): Promise<TSummaryWorklogDataByDate> {
  //   const { worklogData, issueData } =
  //     await this.jiraHandlerService.summaryWorklog();

  // }
}
