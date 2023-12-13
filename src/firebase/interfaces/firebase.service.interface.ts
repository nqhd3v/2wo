import { firestore } from 'firebase-admin';

export interface IFirebaseService {
  createDailyEvent(
    e: Omit<TDailyEvent, 'exclude'>,
  ): Promise<TFsDailyEvent | null>;
  updateDailyEvent(e: Partial<TDailyEvent>): Promise<TFsDailyEvent>;
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
