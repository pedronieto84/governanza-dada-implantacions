import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';

// Reemplaza esto con la forma en que quieras autenticarte si lo corres en local
// Puedes exportar la variable GOOGLE_APPLICATION_CREDENTIALS="path/a/tu/cuenta-de-servicio.json" en tu terminal antes de correr esto
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const MUNICIPIS_DIR = path.join(DATA_DIR, 'municipis');

async function migrate() {
  console.log('Starting migration to Firestore...');

  // 1. Migrate global data (files in data directory directly)
  if (fs.existsSync(DATA_DIR)) {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const page = file.replace('.json', '');
      const filePath = path.join(DATA_DIR, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        await db.collection('global_data').doc(page).set({ payload: content });
        console.log(`Migrated global data: ${page}`);
      } catch (error) {
        console.error(`Error migrating global data ${page}:`, error);
      }
    }
  }

  // 2. Migrate municipis data
  if (fs.existsSync(MUNICIPIS_DIR)) {
    const slugDirs = fs.readdirSync(MUNICIPIS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const slug of slugDirs) {
      const slugDir = path.join(MUNICIPIS_DIR, slug);
      
      // Ensure the parent exists
      await db.collection('municipis').doc(slug).set({ exists: true }, { merge: true });

      const files = fs.readdirSync(slugDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const page = file.replace('.json', '');
        const filePath = path.join(slugDir, file);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          await db.collection('municipis').doc(slug).collection('pages').doc(page).set({ payload: content });
          console.log(`Migrated municipi ${slug} page: ${page}`);
        } catch (error) {
          console.error(`Error migrating municipi ${slug} page ${page}:`, error);
        }
      }
    }
  }

  console.log('Migration finished!');
}

migrate().catch(console.error);