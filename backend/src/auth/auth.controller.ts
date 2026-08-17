import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import type { AuthenticatedRequest } from './firebase-auth.guard';

@Controller('auth')
@UseGuards(FirebaseAuthGuard)
export class AuthController {
  @Get('me')
  getMe(@Req() request: AuthenticatedRequest) {
    return request.access;
  }
}