import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Inject, Req, UseGuards } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AccessService } from '../auth/access.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { AuthenticatedRequest } from '../auth/firebase-auth.guard';

@Controller('data') // Prefix changed to 'data' assuming api is set globally in main.ts
@UseGuards(FirebaseAuthGuard)
export class DataController {

  constructor(
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
    private readonly accessService: AccessService,
  ) {}

  /** Returns an index of all municipalities that have real data.
   *  Shape: { [slug]: { [page]: rowCount } }
   */
  @Get('municipis')
  async getMunicipisIndex(@Req() request: AuthenticatedRequest) {
    const index: Record<string, Record<string, number>> = {};
    
    // In Firestore, retrieving all collections sizes per municipality can be heavy.
    // Instead, we will assume you update a specific index document or just fetch all municipis.
    try {
      const municipisSnapshot = await this.db.collection('municipis').get();
      
      for (const doc of municipisSnapshot.docs) {
        const slug = doc.id;
        if (!request.access.isAdmin && !request.access.municipalitySlugs.includes(slug)) {
          continue;
        }
        index[slug] = {};
        
        // Fetch pages subcollection sizes
        const pagesSnapshot = await doc.ref.collection('pages').get();
        for (const pageDoc of pagesSnapshot.docs) {
          const pageName = pageDoc.id;
          const data = pageDoc.data();
          index[slug][pageName] = this.countRows(data?.payload || data);
        }
      }
      return index;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error reading municipis index', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('municipis/:slug/:page')
  async getMunicipiData(
    @Param('slug') slug: string,
    @Param('page') page: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.validateSegment(slug);
    this.validateSegment(page);
    this.accessService.assertMunicipality(request.access, slug);
    try {
      const docRef = this.db.doc(`municipis/${slug}/pages/${page}`);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        const data = docSnap.data();
        return data?.payload || data; // Adapt depending on how it was saved
      }
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    } catch (error) {
       if (error instanceof HttpException) throw error;
       console.error(error);
       throw new HttpException('Error reading data from Firestore', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('municipis/:slug/:page')
  async saveMunicipiData(
    @Param('slug') slug: string,
    @Param('page') page: string,
    @Body() data: any,
    @Req() request: AuthenticatedRequest,
  ) {
    this.validateSegment(slug);
    this.validateSegment(page);
    this.accessService.assertMunicipality(request.access, slug);
    try {
      const docRef = this.db.doc(`municipis/${slug}/pages/${page}`);
      
      // Ensure the parent municipality document exists
      await this.db.doc(`municipis/${slug}`).set({ exists: true }, { merge: true });
      
      // Save payload
      await docRef.set({ payload: data });
      return { success: true };
    } catch (error) {
       console.error(error);
       throw new HttpException('Error saving data to Firestore', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':page')
  async getData(
    @Param('page') page: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.validateSegment(page);
    this.accessService.assertAdmin(request.access);
    try {
      const docRef = this.db.collection('global_data').doc(page);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const data = docSnap.data();
        return data?.payload || data;
      } else {
        throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new HttpException('Error reading data from Firestore', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':page')
  async saveData(
    @Param('page') page: string,
    @Body() data: any,
    @Req() request: AuthenticatedRequest,
  ) {
    this.validateSegment(page);
    this.accessService.assertAdmin(request.access);
    try {
      const docRef = this.db.collection('global_data').doc(page);
      await docRef.set({ payload: data });
      return { success: true, message: 'Data saved successfully in Firestore' };
    } catch (error) {
      console.error(error);
      throw new HttpException('Error saving data to Firestore', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Prevent path traversal attacks */
  private validateSegment(segment: string) {
    if (!/^[a-z0-9-]+$/.test(segment)) {
      throw new HttpException('Invalid parameter', HttpStatus.BAD_REQUEST);
    }
  }

  /** Count total rows across all top-level arrays in a JSON object */
  private countRows(data: any): number {
    if (Array.isArray(data)) return data.length;
    if (data && typeof data === 'object') {
      return Object.values(data)
        .filter(v => Array.isArray(v))
        .reduce((sum, arr) => sum + (arr as any[]).length, 0);
    }
    return 0;
  }
}
