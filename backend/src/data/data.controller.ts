import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/data')
export class DataController {
  private readonly dataDir = path.join(process.cwd(), '..', 'data');

  constructor() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
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
      // Return 404 if file doesn't exist yet, frontend can handle this as empty data
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
}
