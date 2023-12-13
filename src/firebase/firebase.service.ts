import { Inject, Injectable } from '@nestjs/common';
import {
  IFirebaseService,
  TDailyEvent,
  TFsDailyEvent,
} from './interfaces/firebase.service.interface';
import { firestore, app } from 'firebase-admin';
import { FIREBASE_PROVIDER } from 'src/app/firebase.provider';

@Injectable()
export class FirebaseService implements IFirebaseService {
  _fs: firestore.Firestore;
  _collection: firestore.CollectionReference;

  constructor(@Inject(FIREBASE_PROVIDER) private firebaseApp: app.App) {
    this._fs = this.firebaseApp.firestore();
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

  public async getDailyEvent(): Promise<TFsDailyEvent | null> {
    const dailyDoc = await this._collection.doc('daily-event').get();
    if (!dailyDoc.exists) {
      return null;
    }

    return dailyDoc.data() as TFsDailyEvent;
  }

  public async updateDailyEvent(e: Partial<TDailyEvent>) {
    await this._collection.doc('daily-event').set(e, { merge: true });
    return await this.getDailyEvent();
  }
}
