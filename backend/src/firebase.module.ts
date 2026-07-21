import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin globally
if (!admin.apps.length) {
  admin.initializeApp({
    // It will automatically use ADC (Application Default Credentials) when running in Firebase
    // For local dev, you can use the FIREBASE_CONFIG env var or export GOOGLE_APPLICATION_CREDENTIALS
  });
}

export const db = admin.firestore();

@Global()
@Module({
  providers: [
    {
      provide: 'FIRESTORE',
      useValue: db,
    },
  ],
  exports: ['FIRESTORE'],
})
export class FirebaseModule {}
