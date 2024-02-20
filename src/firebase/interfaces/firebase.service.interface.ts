import { firestore } from 'firebase-admin';

export interface IFirebaseService {
  createDailyEvent(
    e: Omit<TDailyEvent, 'exclude'>,
  ): Promise<TFsDailyEvent | null>;
  // syncMemberOffByDate(
  //   date: string,
  //   members: string[],
  // ): Promise<TFsDailyMemberOff | null>;
  // syncMemberOffByDates(
  //   data: { full: string[]; half: string[]; wfh: string[]; date: string }[],
  // ): Promise<TFsMemberOff>;
  updateDailyEvent(e: Partial<TDailyEvent>): Promise<TFsDailyEvent>;
  // getDailyMemberOff(date?: string): Promise<TFsDailyMemberOff | null>;
  getDailyEvent(): Promise<TFsDailyEvent | null>;
}

export const FIREBASE_SERVICE = 'FIREBASE-SERVICE';

export type TDailyEvent = {
  eventId: string;
  name: string;
  startedAt: Date;
  exclude: string[];
  meetingLink: string | null;
  eventLink: string;
  attendees: string[];
};

export type TFsDailyEvent = Omit<TDailyEvent, 'startedAt'> & {
  startedAt: firestore.Timestamp;
};

export type TFsDailyMemberOff = {
  half: string[];
  full: string[];
  wfh: string[];
};
export type TFsMemberOff = Record<string, TFsDailyMemberOff>;
