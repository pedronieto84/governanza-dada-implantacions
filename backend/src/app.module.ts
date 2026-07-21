import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { FirebaseModule } from './firebase.module';

@Module({
  imports: [FirebaseModule, DataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
