import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type * as admin from 'firebase-admin';
import { AccessService, UserAccess } from './access.service';

describe('AccessService', () => {
  let service: AccessService;

  beforeEach(() => {
    service = new AccessService({} as admin.firestore.Firestore);
  });

  it('rejects requests without a Firebase bearer token', async () => {
    await expect(service.authenticate()).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('normalizes municipality assignments and discards invalid values', () => {
    expect(
      service.normalizeMunicipalitySlugs([
        'premia-de-dalt',
        'barcelona',
        'premia-de-dalt',
        '../invalid',
        42,
      ]),
    ).toEqual(['barcelona', 'premia-de-dalt']);
  });

  it('denies a non-admin user access to an unassigned municipality', () => {
    const access: UserAccess = {
      uid: 'user-1',
      email: 'user@example.com',
      isAdmin: false,
      municipalitySlugs: ['premia-de-dalt'],
    };

    expect(() => service.assertMunicipality(access, 'barcelona')).toThrow(
      ForbiddenException,
    );
    expect(() =>
      service.assertMunicipality(access, 'premia-de-dalt'),
    ).not.toThrow();
  });

  it('allows configured administrators to access every municipality', () => {
    const access: UserAccess = {
      uid: 'admin-1',
      email: 'pedro.nieto.sanchez@gmail.com',
      isAdmin: true,
      municipalitySlugs: [],
    };

    expect(service.isAdminEmail(access.email)).toBe(true);
    expect(() => service.assertMunicipality(access, 'barcelona')).not.toThrow();
    expect(() => service.assertAdmin(access)).not.toThrow();
  });
});