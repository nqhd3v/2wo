import { Controller, Param, Post, Inject, Body, Query } from '@nestjs/common';
// import { AppService } from './app.service';
// import { IJiraService, JIRA_SERVICE } from 'src/jira/interfaces';
import {
  IJiraHandlersService,
  JIRA_HANDLERS_SERVICE,
  TSummaryIssueData,
  TSummaryWorkLogResponse,
  TSummaryWorklogDataByDate,
} from 'src/jira/interfaces/jira-handler.service.interface';
// import { EVENT_SERVICE, IEventService } from 'src/events/interfaces';
import { JiraAuthDTO } from './dto';
import { arrayToDictionary } from 'helpers/array-to-dictionary';
import { TArrayElement, TValueOf } from 'types';
import { IJiraService, JIRA_SERVICE } from 'src/jira/interfaces';
// import { IJiraService, JIRA_SERVICE } from 'src/jira/interfaces';

@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService,
    @Inject(JIRA_SERVICE)
    private readonly jiraService: IJiraService,
    @Inject(JIRA_HANDLERS_SERVICE)
    private readonly jiraHandlerService: IJiraHandlersService,
  ) {}

  @Post('myself')
  public async getMyWorklogSummary(@Body() auth: JiraAuthDTO) {
    const currentUser = await this.jiraService.getMyself(
      auth.username,
      auth.accessToken,
    );
    return currentUser;
  }

  @Post('worklog-summary/:boardId')
  public async worklogSummaryBoardID(
    @Param('boardId') boardId: string,
    @Query('date') date: string,
    @Query('accountId') accountId: string,
    @Body() auth: JiraAuthDTO,
  ) {
    const { worklogData, issueData } =
      await this.jiraHandlerService.mySummaryWorklog(auth, Number(boardId));
    const issueDic = arrayToDictionary(issueData, 'key');
    if (date) {
      const worklogsByDate = worklogData[date];
      if (!worklogsByDate) return { [date]: {} };
      return {
        [date]: this.transformWorklogWithIssueData(
          worklogsByDate,
          issueDic,
          accountId,
        ),
      };
    }

    return Object.keys(worklogData).reduce((acc, date) => {
      acc[date] = this.transformWorklogWithIssueData(
        worklogData[date],
        issueDic,
        accountId,
      );
      return acc;
    }, {});
  }

  private transformWorklogWithIssueData(
    worklogByAccount: TValueOf<TSummaryWorklogDataByDate>,
    issueDic: Record<string, TArrayElement<TSummaryIssueData>>,
    onlyAccountId?: string,
  ): TSummaryWorkLogResponse {
    if (onlyAccountId) {
      const worklogByAccountId = worklogByAccount[onlyAccountId];
      if (!worklogByAccountId) return { [onlyAccountId]: undefined };
      const worklogDataByIssue: TValueOf<TSummaryWorkLogResponse>['details'] =
        {};

      Object.keys(worklogByAccountId.details).forEach((issueKey) => {
        worklogDataByIssue[issueKey] = {
          summary: issueDic[issueKey].summary,
          timeSpentSeconds: worklogByAccountId.details[issueKey],
        };
      });
      return {
        [onlyAccountId]: {
          ...worklogByAccountId,
          details: worklogDataByIssue,
        },
      };
    }
    return Object.keys(worklogByAccount).reduce((acc, accountId) => {
      const { details: timeSpentByIssue } = worklogByAccount[accountId];
      const worklogDataByIssue: TValueOf<TSummaryWorkLogResponse>['details'] =
        {};

      Object.keys(timeSpentByIssue).forEach((issueKey) => {
        worklogDataByIssue[issueKey] = {
          summary: issueDic[issueKey].summary,
          timeSpentSeconds: timeSpentByIssue[issueKey],
        };
      });
      acc[accountId] = {
        ...worklogByAccount[accountId],
        details: worklogDataByIssue,
      };

      return acc;
    }, {});
  }
}
