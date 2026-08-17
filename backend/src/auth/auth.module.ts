import { Global, Module } from '@nestjs/common';
import { AccessService } from './access.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { AdminController } from './admin.controller';
import { AuthController } from './auth.controller';

@Global()
@Module({
  controllers: [AdminController, AuthController],
  providers: [AccessService, FirebaseAuthGuard],
  exports: [AccessService, FirebaseAuthGuard],
})
export class AuthModule {}