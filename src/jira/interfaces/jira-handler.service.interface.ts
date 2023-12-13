import { JiraAuthDTO } from 'src/app/dto';
import { TArrayElement } from 'types';
import { TSprintJira } from 'types/jira';

export type TSummaryWorklog = {
  accountId: string;
  name: string;
  secsSpent: number;
  details: { [issueKey: string]: number };
};
export type TSummaryWorklogDataByDate = {
  [date: string]: {
    [accountId: string]: TSummaryWorklog | undefined;
  };
};

export type TSummaryWorkLogResponse = {
  [accountId: string]: Omit<TSummaryWorklog, 'details'> & {
    details: Record<
      string,
      Pick<TArrayElement<TSummaryIssueData>, 'summary' | 'timeSpentSeconds'>
    >;
  };
};

export type TSummaryIssueData = {
  key: string;
  summary: string;
  originalEstimateSeconds: number;
  remainingEstimateSeconds: number;
  timeSpentSeconds: number;
}[];

export const JIRA_HANDLERS_SERVICE = 'JIRA-HANDLERS-SERVICE';
export interface IJiraHandlersService {
  mySummaryWorklog(
    auth: JiraAuthDTO,
    boardId: number,
  ): Promise<{
    worklogData: TSummaryWorklogDataByDate;
    issueData: TSummaryIssueData;
    sprint: TSprintJira;
  }>;
  summaryWorklog(sprintId?: number): Promise<{
    worklogData: TSummaryWorklogDataByDate;
    issueData: TSummaryIssueData;
    sprint: TSprintJira;
  }>;
}
