import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FIREBASE_SERVICE } from './interfaces';
import { FIREBASE_PROVIDER, FirebaseProvider } from 'src/app/firebase.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FIREBASE_SERVICE,
      useClass: FirebaseService,
    },
    FirebaseProvider,
  ],
  exports: [FIREBASE_SERVICE, FIREBASE_PROVIDER],
})
export class FirebaseModule {}
