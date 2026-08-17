import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { FirebaseModule } from './firebase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [FirebaseModule, AuthModule, DataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
