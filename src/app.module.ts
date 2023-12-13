import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { WorkersModule } from './workers/workers.module';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { JiraModule } from './jira/jira.module';
import { DiscordModule } from './discord/discord.module';
import * as Joi from 'joi';
import { FirebaseModule } from './firebase/firebase.module';
import { FIREBASE_PROVIDER, FirebaseProvider } from './app/firebase.provider';

@Module({
  imports: [
    FirebaseModule,
    WorkersModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        FIREBASE_PROJECT_ID: Joi.string().required(),
        FIREBASE_PRIVATE_KEY_ID: Joi.string().required(),
        FIREBASE_PRIVATE_KEY: Joi.string().required(),
        FIREBASE_CLIENT_EMAIL: Joi.string().required(),
        FIREBASE_CLIENT_ID: Joi.string().required(),
        FIREBASE_AUTH_URI: Joi.string().required(),
        FIREBASE_TOKEN_URI: Joi.string().required(),
        FIREBASE_AUTH_CERT_URL: Joi.string().required(),
        FIREBASE_CLIENT_CERT_URL: Joi.string().required(),
        FIREBASE_UNIVERSAL_DOMAIN: Joi.string().required(),
      }),
    }),
    EventsModule,
    JiraModule,
    DiscordModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
