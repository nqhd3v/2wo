import { Injectable, Inject } from '@nestjs/common';
import {
  IJiraHandlersService,
  TSummaryIssueData,
  IJiraService,
  JIRA_SERVICE,
  TSummaryWorklogDataByDate,
} from './interfaces';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';
import { TWorklogResponse } from 'types/jira';
import { JiraAuthDTO } from 'src/app/dto';

@Injectable()
export class JiraHandlersService implements IJiraHandlersService {
  constructor(
    @Inject(JIRA_SERVICE) private readonly jiraService: IJiraService,
    private readonly configService: ConfigService,
  ) {}

  public async summaryWorklog(sprintId?: number) {
    const { logs: issues, sprint } = sprintId
      ? await this.jiraService.getWorklogsBySprintId(
          this.configService.get<string>('WORKER_JR_USERNAME'),
          this.configService.get<string>('WORKER_JR_PASSWORD'),
          sprintId,
        )
      : await this.jiraService.getWorklogsByActiveSprint(
          this.configService.get<string>('WORKER_JR_USERNAME'),
          this.configService.get<string>('WORKER_JR_PASSWORD'),
          this.configService.get<number>('WORKER_JR_BOARD_ID'),
        );

    const { worklogData, issueData } = this.summaryWorklogByWorklogData(issues);
    return { worklogData, issueData, sprint };
  }

  public async mySummaryWorklog(
    { username, accessToken }: JiraAuthDTO,
    boardId: number,
  ) {
    const { logs: issues, sprint } =
      await this.jiraService.getWorklogsByActiveSprint(
        username,
        accessToken,
        boardId,
      );

    const { worklogData, issueData } = this.summaryWorklogByWorklogData(issues);
    return { worklogData, issueData, sprint };
  }

  private summaryWorklogByWorklogData(issues: TWorklogResponse[]): {
    worklogData: TSummaryWorklogDataByDate;
    issueData: TSummaryIssueData;
  } {
    // Filter
    const worklogData: TSummaryWorklogDataByDate = {};
    const issueData: TSummaryIssueData = issues.map((i) => {
      i.worklogs.forEach((wkl) => {
        const date = dayjs(new Date(wkl.time)).format('DD/MM/YYYY');
        if (!worklogData[date]) worklogData[date] = {};
        if (!worklogData[date][wkl.author.accountId]) {
          worklogData[date][wkl.author.accountId] = {
            accountId: wkl.author.accountId,
            name: wkl.author.displayName,
            secsSpent: wkl.secondsSpent,
            details: {
              [i.key]: wkl.secondsSpent,
            },
          };
          return;
        }
        const wklInfo = worklogData[date][wkl.author.accountId];
        worklogData[date][wkl.author.accountId] = {
          ...wklInfo,
          secsSpent: wklInfo.secsSpent + wkl.secondsSpent,
          details: {
            ...wklInfo.details,
            [i.key]: (wklInfo.details[i.key] || 0) + wkl.secondsSpent,
          },
        };
      });

      return {
        key: i.key,
        summary: i.summary,
        originalEstimateSeconds: i.originalEstimateSeconds,
        remainingEstimateSeconds: i.remainingEstimateSeconds,
        timeSpentSeconds: i.timeSpentSeconds,
      };
    });

    return {
      worklogData,
      issueData,
    };
  }
}
