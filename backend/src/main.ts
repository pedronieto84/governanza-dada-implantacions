import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';
import * as functions from 'firebase-functions/v2';

const server = express();

export const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  
  app.enableCors();
  
  app.setGlobalPrefix('api'); // Firebase Hosting forwards /api requests to this function.

  await app.init();
};

createNestServer(server)
  .then(() => {
    if (process.env.FUNCTION_TARGET || process.env.K_SERVICE || process.env.PORT) {
      console.log('Nest Ready');
      return;
    }

    const port = Number(process.env.PORT) || 3005;
    server.listen(port, () => console.log(`Nest Ready on port ${port}`));
  })
  .catch((err) => console.error('Nest broken', err));

// Export as Firebase HTTP Function v2
export const api = functions.https.onRequest(server);


