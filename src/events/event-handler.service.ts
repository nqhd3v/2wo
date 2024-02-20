import { Injectable, Inject } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { IEventHandlersService } from './interfaces';
import {
  IJiraHandlersService,
  JIRA_HANDLERS_SERVICE,
  TSummaryWorklog,
} from 'src/jira/interfaces';
import { arrayToDictionary } from 'helpers/array-to-dictionary';

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

  // public async sprintWorklogReport(sprintId?: number) {
  //   const { worklogData, issueData, sprint } =
  //     await this.jiraHandlerService.summaryWorklog(sprintId);
  //   try {
  //     const issueDic = arrayToDictionary(issueData, 'key');
  //     const worklogDataByDate = Object.keys(worklogData).reduce(
  //       (accWorklogByDate, date) => {
  //         accWorklogByDate[date] = Object.keys(worklogData[date]).reduce(
  //           (acc, accountId) => {
  //             const { details: timeSpentByIssue } =
  //               worklogData[date][accountId];

  //             acc[accountId] = {
  //               ...worklogData[date][accountId],
  //               details: Object.keys(timeSpentByIssue).reduce(
  //                 (accTimeSpent, issueKey) => {
  //                   accTimeSpent[issueKey] = {
  //                     summary: issueDic[issueKey].summary,
  //                     timeSpentSeconds: timeSpentByIssue[issueKey],
  //                   };
  //                   return accTimeSpent;
  //                 },
  //                 {},
  //               ),
  //             };

  //             return acc;
  //           },
  //           {},
  //         );
  //         return accWorklogByDate;
  //       },
  //       {},
  //     );

  //     return {
  //       sprint,
  //       worklog: worklogDataByDate,
  //     };
  //   } catch (error) {
  //     console.error('Error when generate pre-data for Worker:', error);
  //     throw error;
  //   }
  // }
}
