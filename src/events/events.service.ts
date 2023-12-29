import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import {
  EVENT_HANDLERS_SERVICE,
  IEventHandlersService,
  IEventService,
} from './interfaces';
import { ConfigService } from '@nestjs/config';
import { generateWorklogReportByDate } from 'helpers/daily-worklog-report';
import { generateWorklogReport } from 'helpers/sprint-worklog-report';
import { FIREBASE_SERVICE, IFirebaseService } from 'src/firebase/interfaces';
import { randomMember } from 'helpers/random-member';
import { APM_MEMBERS } from 'common/constant';
import { generateDailyScrumHost } from 'helpers/daily-meeting-hosted';
import { generateDailyMemberOff } from 'helpers/daily-member-off';

@Injectable()
export class EventsService implements IEventService {
  request: (data?: any) => Promise<any>;
  constructor(
    @Inject(EVENT_HANDLERS_SERVICE)
    private readonly eventHandlerService: IEventHandlersService,
    @Inject(FIREBASE_SERVICE)
    private readonly firebaseService: IFirebaseService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.request = (data) => {
      try {
        return this.httpService.axiosRef.post(
          this.configService.get<string>('GOOGLE_CHAT_WEBHOOK'),
          data,
        );
      } catch (error: any) {
        console.error(
          'Error when send Google Chat Hook:',
          error.response || error.request || error,
        );
        throw error;
      }
    };
  }

  public async sendDailyScrumMeeting() {
    try {
      const today = dayjs();
      const event = await this.firebaseService.getDailyEvent();
      console.log(event.startedAt);
      const eventDate = event ? dayjs(event.startedAt.toDate()) : dayjs();
      if (!event || !eventDate.isSame(today, 'date')) {
        throw new BadRequestException(
          `Existed "daily-scrum" in Firestore (but for "${eventDate.format(
            'DD/MM/YYYY',
          )}")`,
        );
      }

      const memberEmails = event.attendees;
      const membersJoin = Array.isArray(memberEmails)
        ? memberEmails.map((m) => m.replace('.tpv@one-line.com', ''))
        : undefined;
      // Filter from cache
      const eventExclude = event.exclude || [];
      Logger.log('Member hosted before: ' + JSON.stringify(eventExclude));
      let noteMsg = '';
      let membersExclude = [];
      let memberHosted = randomMember(APM_MEMBERS, membersJoin, eventExclude);
      if (membersJoin.length === 0) {
        // No one join meeting (dsEvent.attendees = [])
        Logger.log('No one join this meeting! Random based on all member');
        noteMsg =
          'It looks like <b>no one joined</b> this meeting (<i>NO ATTENDEES</i>). Random based on all the members!<br/>This meeting host will <b>not be added</b> to <b>the exclude list in the next few days</b>!';
        memberHosted = randomMember(APM_MEMBERS);
        membersExclude = [...eventExclude];
      } else if (memberHosted.id === '-1') {
        // The exclude list is full -> Reset to empty.
        memberHosted = randomMember(APM_MEMBERS, membersJoin);
        membersExclude = [memberHosted.alias];
      } else {
        Logger.log(`Added "${memberHosted.alias}" to hosted list!`);
        membersExclude = [...eventExclude, memberHosted.alias];
      }
      console.log(memberHosted, membersExclude);
      await this.firebaseService.updateDailyEvent({ exclude: membersExclude });

      const membersQuery = Object.keys(APM_MEMBERS)
        .map((mem) => (mem === memberHosted.alias ? `_${mem}` : mem))
        .join('@');
      const membersEncoded = encodeURIComponent(membersQuery);

      await this.request(
        generateDailyScrumHost(memberHosted, event.startedAt.toDate(), {
          meetingLink: event.meetingLink,
          eventLink: event.eventLink,
          newHostedLink: `https://team.nqhuy.dev/p/tools/random/${membersEncoded}`,
          noteMessage: noteMsg,
        }),
      );

      // return generateWorklogReportByDate(data, date);
    } catch (error) {
      console.error('Error when send report to Google Chat:', error);
      throw error;
    }
  }

  public async sendDailyWorklogSummary(date?: string) {
    try {
      const data = await this.eventHandlerService.dailyWorklogReport(date);

      await this.request(generateWorklogReportByDate(data, date));

      return generateWorklogReportByDate(data, date);
    } catch (error) {
      console.error('Error when send report to Google Chat:', error);
      throw error;
    }
  }

  public async sendDailyDateOffMember(date?: string) {
    try {
      const data = await this.firebaseService.getDailyMemberOff(date);
      if (!data) {
        throw new BadRequestException(`No data date-off for date (${date})`);
      }
      if (
        !Array.isArray(data.full) ||
        !Array.isArray(data.half) ||
        !Array.isArray(data.wfh)
      ) {
        throw new BadRequestException(`Data is INVALID for date (${date})`);
      }

      await this.request(
        generateDailyMemberOff({ date: date.replace('_', '/'), ...data }),
      );

      return generateDailyMemberOff({ date: date.replace('_', '/'), ...data });
    } catch (error) {
      console.error('Error when send report to Google Chat:', error);
      throw error;
    }
  }

  public async sendSprintWorklogSummary(sprintId?: number) {
    try {
      const { sprint, worklog } =
        await this.eventHandlerService.sprintWorklogReport(sprintId);

      await this.request(generateWorklogReport(sprint, worklog));

      return generateWorklogReport(sprint, worklog);
    } catch (error) {
      console.error('Error when send report to Google Chat:', error);
      throw error;
    }
  }

  @Cron('30 8 * * 1-5', {
    name: 'daily_scrum_meeting',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async dailyScrumMeeting() {
    Logger.log(' - Random member to host daily-scrum');
    try {
      return this.sendDailyScrumMeeting();
    } catch (error) {
      console.error("Error when run cron 'Daily Scrum Meeting':", error);
      throw error;
    }
  }

  @Cron('25 8 * * 1-5', {
    name: 'date_off_planned',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async memberDateOff() {
    Logger.log(' - Date-off planned for members');
    try {
      return this.sendDailyDateOffMember();
    } catch (error) {
      console.error("Error when run cron 'Date-Off Planned':", error);
      throw error;
    }
  }

  @Cron('15 17 * * 1-5', {
    name: 'daily_report_worklog',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async dailyReportWorklog() {
    const today = dayjs().format('DD/MM/YYYY');
    Logger.log(` - Create worklog-report daily (${today})`);
    try {
      return this.sendDailyWorklogSummary(today);
    } catch (error) {
      console.error("Error when run cron 'Daily Report Worklog':", error);
      throw error;
    }
  }
}
