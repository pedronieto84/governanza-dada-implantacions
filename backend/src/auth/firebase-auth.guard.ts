import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AccessService, UserAccess } from './access.service';

export interface AuthenticatedRequest extends Request {
  access: UserAccess;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly accessService: AccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.access = await this.accessService.authenticate(
      request.headers.authorization,
    );
    return true;
  }
}