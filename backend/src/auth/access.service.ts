import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface UserAccess {
  uid: string;
  email: string;
  isAdmin: boolean;
  municipalitySlugs: string[];
}

@Injectable()
export class AccessService {
  private readonly adminEmails = new Set(
    (process.env.ADMIN_EMAILS ?? 'pedro.nieto.sanchez@gmail.com')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

  constructor(
    @Inject('FIRESTORE')
    private readonly db: admin.firestore.Firestore,
  ) {}

  async authenticate(authorization?: string): Promise<UserAccess> {
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const token = await admin.auth().verifyIdToken(match[1], true);
      const email = token.email?.toLowerCase() ?? '';
      const accessDocument = await this.db.collection('user_access').doc(token.uid).get();
      const municipalitySlugs = this.normalizeMunicipalitySlugs(
        accessDocument.data()?.municipalitySlugs,
      );

      return {
        uid: token.uid,
        email,
        isAdmin:
          this.adminEmails.has(email) || accessDocument.data()?.isAdmin === true,
        municipalitySlugs,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  assertMunicipality(access: UserAccess, slug: string): void {
    if (!access.isAdmin && !access.municipalitySlugs.includes(slug)) {
      throw new ForbiddenException('Municipality access denied');
    }
  }

  assertAdmin(access: UserAccess): void {
    if (!access.isAdmin) {
      throw new ForbiddenException('Administrator access required');
    }
  }

  isAdminEmail(email?: string): boolean {
    return this.adminEmails.has(email?.trim().toLowerCase() ?? '');
  }

  normalizeMunicipalitySlugs(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return [...new Set(value)]
      .filter(
        (slug): slug is string =>
          typeof slug === 'string' && /^[a-z0-9-]+$/.test(slug),
      )
      .sort();
  }
}