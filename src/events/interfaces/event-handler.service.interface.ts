import {
  TSummaryWorklog,
  // TSummaryWorklogDataByDate,
} from 'src/jira/interfaces';

export const EVENT_HANDLERS_SERVICE = 'EVENT-HANDLERS-SERVICE';
export interface IEventHandlersService {
  dailyWorklogReport(date?: string): Promise<TSummaryWorklog[]>;
  // weeklyWorklogReport(): Promise<TSummaryWorklogDataByDate>;
}
