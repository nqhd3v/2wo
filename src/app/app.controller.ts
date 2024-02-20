import {
  Controller,
  Post,
  Inject,
  Body,
  Query,
  BadRequestException,
  Get,
  UseGuards,
} from '@nestjs/common';
// import {
//   IJiraHandlersService,
//   JIRA_HANDLERS_SERVICE,
// } from 'src/jira/interfaces/jira-handler.service.interface';
import { JiraAuthDTO } from './dto';
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
    // @Inject(JIRA_HANDLERS_SERVICE)
    // private readonly jiraHandlerService: IJiraHandlersService,
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService,
  ) {}

  @UseGuards(AppGuard)
  @Post('myself')
  public async initConnect(@Body() auth: JiraAuthDTO) {
    const currentUser = await this.jiraService.getMyself(
      auth.username,
      auth.accessToken,
    );
    return currentUser;
  }

  // manual trigger daily scrum
  @UseGuards(AppGuard)
  @Get('meetings/daily-scrum')
  public async triggerDailyScrumEvent() {
    return await this.eventService.sendDailyScrumMeeting();
  }

  // update daily-scrum for today
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

  // manual trigger daily-report logwork
  @UseGuards(AppGuard)
  @Get('worklog-summary/date/send')
  public async sendDailyWorklogSummary(@Query('date') date: string) {
    return await this.eventService.sendDailyWorklogSummary(date);
  }
}
