import { Inject, Injectable } from '@nestjs/common';
import {
  IFirebaseService,
  TDailyEvent,
  TFsDailyEvent,
  TFsDailyMemberOff,
  TFsMemberOff,
} from './interfaces/firebase.service.interface';
import { firestore, app } from 'firebase-admin';
import { FIREBASE_PROVIDER } from 'src/app/firebase.provider';
import dayjs from 'dayjs';

@Injectable()
export class FirebaseService implements IFirebaseService {
  _fs: firestore.Firestore;
  _collection: firestore.CollectionReference;
  _batch: firestore.WriteBatch;

  constructor(@Inject(FIREBASE_PROVIDER) private firebaseApp: app.App) {
    this._fs = this.firebaseApp.firestore();
    this._batch = this._fs.batch();
    this._collection = this.firebaseApp
      .firestore()
      .collection('worker_for_working');
  }

  public async createDailyEvent(e: Omit<TDailyEvent, 'exclude'>) {
    const beforeEvent = await this.getDailyEvent();
    const memberExclude = beforeEvent ? beforeEvent.exclude : [];
    await this._collection
      .doc('daily-event')
      .set({ ...e, exclude: memberExclude });
    return await this.getDailyEvent();
  }

  public async syncMemberOffByDate(
    date: string,
    members: string[],
  ): Promise<TFsDailyMemberOff> {
    await this._collection
      .doc('member-date-off')
      .collection('date-off')
      .doc(date.replace('/', '_'))
      .set({ members });
    return await this.getDailyMemberOff();
  }
  public async syncMemberOffByDates(
    data: { full: string[]; half: string[]; wfh: string[]; date: string }[],
  ): Promise<TFsMemberOff> {
    const promises = data.map(async ({ date, ...data }) =>
      this._collection
        .doc('member-date-off')
        .collection('date-off')
        .doc(date.replace('/', '_'))
        .set(data),
    );
    await Promise.all(promises);
    return await this.getDatesMemberOff();
  }

  public async getDailyEvent(): Promise<TFsDailyEvent | null> {
    const dailyDoc = await this._collection.doc('daily-event').get();
    if (!dailyDoc.exists) {
      return null;
    }

    return dailyDoc.data() as TFsDailyEvent;
  }

  public async getDailyMemberOff(date?: string): Promise<TFsDailyMemberOff> {
    const today = date || dayjs().format('MM_DD');
    const dailyDoc = await this._collection
      .doc('member-date-off')
      .collection('date-off')
      .doc(today)
      .get();

    if (!dailyDoc.exists) return null;

    return dailyDoc.data() as TFsDailyMemberOff;
  }

  public async getDatesMemberOff(): Promise<TFsMemberOff> {
    const dateSnapshot = await this._collection
      .doc('member-date-off')
      .collection('date-off')
      .get();

    const res: TFsMemberOff = {};
    dateSnapshot.forEach((d) => {
      res[d.id] = d.data().members || [];
    });

    return res;
  }

  public async updateDailyEvent(e: Partial<TDailyEvent>) {
    await this._collection.doc('daily-event').set(e, { merge: true });
    return await this.getDailyEvent();
  }
}
