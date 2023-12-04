import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IJiraService } from './interfaces';
import {
  TPaginationJira,
  TSprintJira,
  TUserJira,
  TWorklog,
  TWorklogPagination,
  TWorklogResponse,
} from 'types/jira';
import { JIRA_API } from './jira.request';
import { ConfigService } from '@nestjs/config';
import { TBoardJira } from 'types/jira/board.type';
import { TIssuePagination } from 'types/jira/issue.type';

@Injectable()
export class JiraService implements IJiraService {
  request: <T>(
    path: string,
    auth: AxiosRequestConfig['auth'],
    method?: AxiosRequestConfig['method'],
    data?: any,
  ) => Promise<T>;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.request = (path, auth, method = 'GET', data) =>
      this.httpService.axiosRef(path, {
        baseURL: this.configService.get<string>('BASE_JIRA_API'),
        method,
        data,
        auth,
      });
  }
  public async getMyself(username: string, password: string) {
    try {
      const res = await this.request<AxiosResponse<TUserJira>>(
        JIRA_API.user.ME,
        {
          username,
          password,
        },
      );

      return res.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getAllBoards(
    username: string,
    password: string,
    isAll?: boolean,
  ) {
    try {
      const res = await this.request<
        AxiosResponse<TPaginationJira<TBoardJira>>
      >(JIRA_API.board.ALL, {
        username,
        password,
      });

      if (!isAll) {
        const keyword = this.configService
          .get<string>('JIRA_BOARD_NAME_FILTER')
          .trim()
          .toLowerCase();
        const boardsFiltered = res.data.values.filter((b) => {
          const {
            name = '',
            displayName = '',
            projectName = '',
            projectKey = '',
          } = b.location || {};
          return (
            name.toLowerCase().includes(keyword) ||
            displayName.toLowerCase().includes(keyword) ||
            projectName.toLowerCase().includes(keyword) ||
            projectKey.toLowerCase().includes(keyword)
          );
        });

        return {
          ...res.data,
          values: boardsFiltered,
        };
      }

      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async getAllSprintByBoardID(
    username: string,
    password: string,
    boardId: number,
  ) {
    try {
      const res = await this.request<
        AxiosResponse<TPaginationJira<TSprintJira>>
      >(JIRA_API.sprint.ALL(boardId), { username, password });

      return res.data;
    } catch (error) {
      console.error(`Error when get all sprint by boardID#${boardId}:`, error);
      throw error;
    }
  }

  public async getActiveSprintByBoardID(
    username: string,
    password: string,
    boardId: number,
  ) {
    const res = await this.getAllSprintByBoardID(username, password, boardId);
    try {
      const activeSprints = res.values.filter((s) => s.state === 'active');

      if (activeSprints.length === 0) return null;
      return activeSprints[0];
    } catch (error) {
      console.error(
        `Error when get active sprint by boardID#${boardId}:`,
        error,
      );
      throw error;
    }
  }

  async getWorklogsByIssueID(
    u: string,
    p: string,
    issueIds: (number | string)[],
  ) {
    try {
      const errors: Error[] = [];
      const promises = issueIds.map(async (id) => {
        try {
          Logger.log('Get worklogs for issue (' + issueIds.join(',') + ')');
          const worklogByIssue = await this.request<
            AxiosResponse<TWorklogPagination>
          >(JIRA_API.worklog.BY_ISSUE(id), { username: u, password: p });
          return {
            issueId: id,
            worklogs: worklogByIssue.data.worklogs,
          };
        } catch (error) {
          errors.push(error);
          return null;
        }
      });
      const result: Record<number | string, TWorklog[]> = {};
      const data = await Promise.all(promises);
      if (errors.length > 0) {
        throw new BadRequestException({ errors });
      }

      data
        .filter((i) => i)
        .forEach((dataItem) => {
          result[dataItem.issueId] = dataItem.worklogs;
        });

      return result;
    } catch (error) {
      console.error(
        `Error when get worklogs by issue IDs[${issueIds.join(',')}]:`,
        error,
      );
      throw error;
    }
  }

  public async getIssuesBySprintID(
    u: string,
    p: string,
    sprintId: number,
  ): Promise<TIssuePagination> {
    try {
      const res = await this.request<AxiosResponse<TIssuePagination>>(
        JIRA_API.issue.ALL(sprintId),
        { username: u, password: p },
      );

      return res.data;
    } catch (error) {
      console.error(`Error when get worklogs by sprint#${sprintId}:`, error);
      throw error;
    }
  }

  public async getWorklogsByActiveSprint(
    u: string,
    p: string,
    boardId: number,
  ) {
    const activeSprint = await this.getActiveSprintByBoardID(u, p, boardId);
    if (!activeSprint) throw new BadRequestException('No active sprint found!');
    try {
      const issuePagination = await this.request<
        AxiosResponse<TIssuePagination>
      >(JIRA_API.worklog.BY_SPRINT(activeSprint.id), {
        username: u,
        password: p,
      });
      // Filter data
      const issuesHaveWorklogOutRangeIds = issuePagination.data.issues
        .filter((i) => i.fields.worklog.total > i.fields.worklog.maxResults)
        .map((i) => i.id);
      const worklogByIssueOutRange = await this.getWorklogsByIssueID(
        u,
        p,
        issuesHaveWorklogOutRangeIds,
      );

      // Calculate data
      const worklogByIssues: Record<string, TWorklogResponse> = {};
      issuePagination.data.issues.forEach((issue) => {
        if (!worklogByIssues[issue.id]) {
          worklogByIssues[issue.id] = {
            key: issue.key,
            summary: issue.fields.summary,
            worklogs: [],
            issueType: issue.fields.issuetype?.name,
            status: issue.fields.status ? issue.fields.status.name : undefined,
            originalEstimateSeconds:
              issue.fields.timetracking.originalEstimateSeconds,
            remainingEstimateSeconds:
              issue.fields.timetracking.remainingEstimateSeconds,
            timeSpentSeconds: issue.fields.timetracking.timeSpentSeconds,
          };
        }

        if (issue.fields.worklog.total === 0) return;
        const worklogs =
          issue.fields.worklog.total > issue.fields.worklog.maxResults
            ? worklogByIssueOutRange[issue.id]
            : issue.fields.worklog.worklogs;
        worklogByIssues[issue.id].worklogs = worklogs.map((wkl) => ({
          id: wkl.id,
          author: {
            accountId: wkl.author.accountId,
            displayName: wkl.author.displayName,
          },
          secondsSpent: wkl.timeSpentSeconds,
          time: wkl.started,
        }));
      });

      return Object.values(worklogByIssues);
    } catch (error) {
      console.error(
        `Error when get worklogs by active-sprint#${activeSprint.id}:`,
        error,
      );
      throw error;
    }
  }
}
