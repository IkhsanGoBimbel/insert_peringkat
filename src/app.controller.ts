import { Controller, Get, HttpException, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('excel/read')
  @UseInterceptors(FileInterceptorWithDest('./excel'))
  async readExcel(@UploadedFile() file) {
    return this.appService.readFiles(file);
  }

  @Post('excel/find')
  @UseInterceptors(FileInterceptorWithDest('./excel'))
  async readExcel_find_table(@UploadedFile() file) {
    return this.appService.readFilesAndFindBundling(file);
  }

}


export function FileInterceptorWithDest(destination: string) {
  return FileInterceptor('excel', {
    storage: diskStorage({
      destination: destination,
      filename: (req, file, cb) => {
        const table = req.originalUrl.split('/');
        const date = new Date();
        const tanggal = date.getDate();
        const bulan = date.getMonth();
        const tahun = date.getFullYear();
        const jam = date.getHours();
        const menit = date.getMinutes();
        const uniqueSuffix = file.originalname;
        return cb(
          null,
          file.fieldname +
            '-' +
            table[2] +
            '-' +
            tanggal +
            '-' +
            bulan +
            '-' +
            tahun +
            '-' +
            jam +
            '-' +
            menit +
            '-' +
            uniqueSuffix,
        );
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(xlsx)$/)) {
        return cb(new HttpException('Invalid file type', 403), false);
      }
      cb(null, true);
    },
  });
}

