import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('upload')
export class UploadController {
  constructor() {
    // Ensure uploads folder exists
    const uploadPath = './uploads';
    if (!existsSync(uploadPath)) mkdirSync(uploadPath);
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      // ✅ only check file size (example: 5 MB)
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
    }),
    
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const baseUrl = process.env.UPLOAD_URL; 
    const sizeInMB = Number((file.size / (1024 * 1024)).toFixed(2));

    return {
      filename: file.filename,
      url: `${baseUrl}/${file.filename}`,
      sizeMB: sizeInMB,
    };
  }
}
