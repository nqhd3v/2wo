import { TSummaryWorkLogResponse, TSummaryWorklog } from 'src/jira/interfaces';
import { TSprintJira } from 'types/jira';

export const EVENT_HANDLERS_SERVICE = 'EVENT-HANDLERS-SERVICE';
export interface IEventHandlersService {
  dailyWorklogReport(date?: string): Promise<TSummaryWorklog[]>;
  sprintWorklogReport(sprintId?: number): Promise<{
    sprint: TSprintJira;
    worklog: { [date: string]: TSummaryWorkLogResponse };
  }>;
}
