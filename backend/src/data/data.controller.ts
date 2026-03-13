import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/data')
export class DataController {
  private readonly dataDir = path.join(process.cwd(), '..', 'data');
  private readonly municipisDir = path.join(process.cwd(), '..', 'data', 'municipis');

  constructor() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.municipisDir)) {
      fs.mkdirSync(this.municipisDir, { recursive: true });
    }
  }

  /** Returns an index of all municipalities that have real data on disk.
   *  Shape: { [slug]: { [page]: rowCount } }
   */
  @Get('municipis')
  getMunicipisIndex() {
    const index: Record<string, Record<string, number>> = {};
    if (!fs.existsSync(this.municipisDir)) return index;

    const slugDirs = fs.readdirSync(this.municipisDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const slug of slugDirs) {
      const slugDir = path.join(this.municipisDir, slug);
      const files = fs.readdirSync(slugDir).filter(f => f.endsWith('.json'));
      index[slug] = {};
      for (const file of files) {
        const page = file.replace('.json', '');
        try {
          const content = JSON.parse(fs.readFileSync(path.join(slugDir, file), 'utf-8'));
          index[slug][page] = this.countRows(content);
        } catch {
          index[slug][page] = 0;
        }
      }
    }
    return index;
  }

  @Get('municipis/:slug/:page')
  getMunicipiData(@Param('slug') slug: string, @Param('page') page: string) {
    this.validateSegment(slug);
    this.validateSegment(page);
    const filePath = path.join(this.municipisDir, slug, `${page}.json`);
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch {
        throw new HttpException('Error reading data file', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
  }

  @Post('municipis/:slug/:page')
  saveMunicipiData(
    @Param('slug') slug: string,
    @Param('page') page: string,
    @Body() data: any,
  ) {
    this.validateSegment(slug);
    this.validateSegment(page);
    const slugDir = path.join(this.municipisDir, slug);
    if (!fs.existsSync(slugDir)) fs.mkdirSync(slugDir, { recursive: true });
    const filePath = path.join(slugDir, `${page}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return { success: true };
    } catch {
      throw new HttpException('Error saving data file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':page')
  getData(@Param('page') page: string) {
    const filePath = path.join(this.dataDir, `${page}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
      } catch (error) {
        throw new HttpException('Error reading data file', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post(':page')
  saveData(@Param('page') page: string, @Body() data: any) {
    const filePath = path.join(this.dataDir, `${page}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return { success: true, message: 'Data saved successfully' };
    } catch (error) {
      throw new HttpException('Error saving data file', HttpStatus.INTERNAL_SERVER_ERROR);
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
