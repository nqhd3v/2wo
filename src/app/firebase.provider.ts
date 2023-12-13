import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export const FIREBASE_PROVIDER = 'FIREBASE-APP';
export const FIREBASE_APP_NAME = 'FIREBASE-APP-WOWO';

export const FirebaseProvider: Provider = {
  provide: FIREBASE_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const firebaseConfig = {
      type: 'service_account',
      project_id: configService.get<string>('FIREBASE_PROJECT_ID'),
      private_key_id: configService.get<string>('FIREBASE_PRIVATE_KEY_ID'),
      private_key: configService.get<string>('FIREBASE_PRIVATE_KEY'),
      client_email: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      client_id: configService.get<string>('FIREBASE_CLIENT_ID'),
      auth_uri: configService.get<string>('FIREBASE_AUTH_URI'),
      token_uri: configService.get<string>('FIREBASE_TOKEN_URI'),
      auth_provider_x509_cert_url: configService.get<string>(
        'FIREBASE_AUTH_CERT_URL',
      ),
      client_x509_cert_url: configService.get<string>(
        'FIREBASE_CLIENT_CERT_URL',
      ),
      universe_domain: configService.get<string>('FIREBASE_UNIVERSAL_DOMAIN'),
    } as admin.ServiceAccount;

    const appInitialized = admin.apps.find((a) => a.name === FIREBASE_APP_NAME);

    return (
      appInitialized ||
      admin.initializeApp(
        {
          credential: admin.credential.cert(firebaseConfig),
          // databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
          // storageBucket: `${firebaseConfig.projectId}.appspot.com`,
        },
        FIREBASE_APP_NAME,
      )
    );
  },
};
