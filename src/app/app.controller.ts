import {
  Controller,
  Param,
  Post,
  Inject,
  Body,
  Query,
  BadRequestException,
  Get,
  UseGuards,
} from '@nestjs/common';
// import { AppService } from './app.service';
// import { IJiraService, JIRA_SERVICE } from 'src/jira/interfaces';
import {
  IJiraHandlersService,
  JIRA_HANDLERS_SERVICE,
  TSummaryIssueData,
  TSummaryWorkLogResponse,
  TSummaryWorklogDataByDate,
} from 'src/jira/interfaces/jira-handler.service.interface';
import { JiraAuthDTO } from './dto';
import { arrayToDictionary } from 'helpers/array-to-dictionary';
import { TArrayElement, TValueOf } from 'types';
import { IJiraService, JIRA_SERVICE } from 'src/jira/interfaces';
import { EVENT_SERVICE, IEventService } from 'src/events/interfaces';
import { IFirebaseService, FIREBASE_SERVICE } from '../firebase/interfaces';
import {
  CreateGEventsDTO,
  GEventAttendeeResStatusEnum,
} from './dto/google-event.dto';
import { ConfigService } from '@nestjs/config';
import { AppGuard } from './app.guard';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(JIRA_SERVICE)
    private readonly jiraService: IJiraService,
    @Inject(JIRA_HANDLERS_SERVICE)
    private readonly jiraHandlerService: IJiraHandlersService,
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService,
  ) {}

  @Post('tmp')
  public async getIssue() {
    return await this.jiraService.getSubImpByBoardID(
      this.configService.get<string>('WORKER_JR_USERNAME'),
      this.configService.get<string>('WORKER_JR_PASSWORD'),
      this.configService.get<number>('WORKER_JR_BOARD_ID'),
    );
  }

  @Post('myself')
  public async initConnect(@Body() auth: JiraAuthDTO) {
    const currentUser = await this.jiraService.getMyself(
      auth.username,
      auth.accessToken,
    );
    return currentUser;
  }

  @UseGuards(AppGuard)
  @Get('think-working/planning/stories')
  public async getStoriesTodo() {
    return await this.jiraHandlerService.getStoriesTodoByBoardId(809);
  }

  @UseGuards(AppGuard)
  @Post('think-working/planning/sub-imp')
  public async getStoriesWithSubImp(
    @Body() { storyIds }: { storyIds: number[] },
  ) {
    return await this.jiraHandlerService.getSubImpByBoardIdAndStories(
      this.configService.get<number>('WORKER_JR_BOARD_ID'),
      ...storyIds,
    );
  }

  @UseGuards(AppGuard)
  @Get('meetings/daily-scrum')
  public async triggerDailyScrumEvent() {
    return await this.eventService.sendDailyScrumMeeting();
  }

  @UseGuards(AppGuard)
  @Post('meetings/daily-scrum')
  public async createDailyScrumEvent(@Body() { events }: CreateGEventsDTO) {
    if (events.length === 0) throw new BadRequestException('No Event found!');
    const { id, summary, startedAt, meetingLink, eventLink, attendees } =
      events[0];
    const newEvent = await this.firebaseService.createDailyEvent({
      name: summary,
      startedAt: new Date(startedAt),
      meetingLink,
      eventId: id,
      eventLink,
      attendees: attendees
        .filter((a) => a.status !== GEventAttendeeResStatusEnum.DECLINED)
        .map((a) => a.username),
    });

    return newEvent;
  }

  @UseGuards(AppGuard)
  @Post('myself')
  public async getMyWorklogSummary(@Body() auth: JiraAuthDTO) {
    const currentUser = await this.jiraService.getMyself(
      auth.username,
      auth.accessToken,
    );
    return currentUser;
  }

  @UseGuards(AppGuard)
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

  @UseGuards(AppGuard)
  @Post('worklog-summary/date/send')
  public async sendDailyWorklogSummary(@Query('date') date: string) {
    return await this.eventService.sendDailyWorklogSummary(date);
  }

  @UseGuards(AppGuard)
  @Post('worklog-summary/sprint/send')
  public async sendSprintWorklogSummary(@Query('sprintId') sprintId: string) {
    return await this.eventService.sendSprintWorklogSummary(
      sprintId && Number(sprintId),
    );
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
