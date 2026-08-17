import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AccessService } from './access.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import type { AuthenticatedRequest } from './firebase-auth.guard';

interface UpdateUserAccessBody {
  municipalitySlugs?: unknown;
}

interface CreateUserBody extends UpdateUserAccessBody {
  displayName?: unknown;
  email?: unknown;
  password?: unknown;
  isAdmin?: unknown;
}

@Controller('admin')
@UseGuards(FirebaseAuthGuard)
export class AdminController {
  constructor(
    @Inject('FIRESTORE')
    private readonly db: admin.firestore.Firestore,
    private readonly accessService: AccessService,
  ) {}

  @Get('users')
  async getUsers(@Req() request: AuthenticatedRequest) {
    this.accessService.assertAdmin(request.access);

    const users: admin.auth.UserRecord[] = [];
    let pageToken: string | undefined;
    do {
      const page = await admin.auth().listUsers(1000, pageToken);
      users.push(...page.users);
      pageToken = page.pageToken;
    } while (pageToken);

    const accessDocuments = users.length
      ? await this.db.getAll(
          ...users.map((user) =>
            this.db.collection('user_access').doc(user.uid),
          ),
        )
      : [];

    return users.map((user, index) => ({
      uid: user.uid,
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      isAdmin:
        this.accessService.isAdminEmail(user.email) ||
        accessDocuments[index]?.data()?.isAdmin === true,
      disabled: user.disabled,
      municipalitySlugs: this.accessService.normalizeMunicipalitySlugs(
        accessDocuments[index]?.data()?.municipalitySlugs,
      ),
    }));
  }

  @Post('users')
  async createUser(
    @Body() body: CreateUserBody,
    @Req() request: AuthenticatedRequest,
  ) {
    this.accessService.assertAdmin(request.access);

    const displayName =
      typeof body?.displayName === 'string' ? body.displayName.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (
      !displayName ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      password.length < 6 ||
      typeof body?.isAdmin !== 'boolean'
    ) {
      throw new BadRequestException(
        'Name, valid email, password and role are required',
      );
    }

    const municipalitySlugs = await this.validateMunicipalitySlugs(
      body.municipalitySlugs,
    );
    let user: admin.auth.UserRecord;
    try {
      user = await admin.auth().createUser({ displayName, email, password });
    } catch {
      throw new BadRequestException('The user could not be created');
    }

    try {
      await this.db.collection('user_access').doc(user.uid).set({
        isAdmin: body.isAdmin,
        municipalitySlugs: body.isAdmin ? [] : municipalitySlugs,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: request.access.uid,
      });
    } catch (error) {
      await admin.auth().deleteUser(user.uid);
      throw error;
    }

    return {
      uid: user.uid,
      displayName: user.displayName ?? displayName,
      email: user.email ?? email,
      isAdmin: body.isAdmin,
      disabled: user.disabled,
      municipalitySlugs: body.isAdmin ? [] : municipalitySlugs,
    };
  }

  @Get('entities')
  async getEntities(@Req() request: AuthenticatedRequest) {
    this.accessService.assertAdmin(request.access);
    const snapshot = await this.db.collection('municipis').get();
    return snapshot.docs
      .map((document) => ({
        slug: document.id,
        name:
          this.readEntityName(document.data()) ?? this.nameFromSlug(document.id),
      }))
      .sort((left, right) => left.name.localeCompare(right.name, 'ca'));
  }

  @Patch('users/:uid/access')
  async updateUserAccess(
    @Param('uid') uid: string,
    @Body() body: UpdateUserAccessBody,
    @Req() request: AuthenticatedRequest,
  ) {
    this.accessService.assertAdmin(request.access);
    if (!uid || typeof body?.municipalitySlugs === 'undefined') {
      throw new BadRequestException('User and municipalitySlugs are required');
    }

    const municipalitySlugs = await this.validateMunicipalitySlugs(
      body.municipalitySlugs,
    );

    try {
      await admin.auth().getUser(uid);
    } catch {
      throw new NotFoundException('User not found');
    }

    await this.db.collection('user_access').doc(uid).set(
      {
        municipalitySlugs,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: request.access.uid,
      },
      { merge: true },
    );

    return { uid, municipalitySlugs };
  }

  private async validateMunicipalitySlugs(value: unknown): Promise<string[]> {
    const municipalitySlugs =
      this.accessService.normalizeMunicipalitySlugs(value);
    if (
      !Array.isArray(value) ||
      municipalitySlugs.length !== new Set(value).size
    ) {
      throw new BadRequestException('Invalid municipalitySlugs');
    }

    const entityDocuments = municipalitySlugs.length
      ? await this.db.getAll(
          ...municipalitySlugs.map((slug) =>
            this.db.collection('municipis').doc(slug),
          ),
        )
      : [];
    if (entityDocuments.some((document) => !document.exists)) {
      throw new BadRequestException('One or more municipalities do not exist');
    }
    return municipalitySlugs;
  }

  private readEntityName(data: admin.firestore.DocumentData): string | undefined {
    for (const field of ['name', 'nom', 'municipi']) {
      if (typeof data[field] === 'string' && data[field].trim()) {
        return data[field].trim();
      }
    }
    return undefined;
  }

  private nameFromSlug(slug: string): string {
    return slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}