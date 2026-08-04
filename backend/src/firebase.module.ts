import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin globally
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    // Local dev: use the service account key file
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
    });
  } else {
    // Deployed to Firebase: uses ADC (Application Default Credentials) automatically
    admin.initializeApp();
  }
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
