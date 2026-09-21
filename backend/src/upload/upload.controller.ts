import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomBytes } from 'crypto';
import { Roles } from 'src/auth/roles.decorator';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Raster image types only. SVG is excluded on purpose: it can carry script and
 * would be stored-XSS if the uploads folder is ever served inline.
 */
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor() {
    // Ensure uploads folder exists
    const uploadPath = './uploads';
    if (!existsSync(uploadPath)) mkdirSync(uploadPath);
  }

  @Post('image')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // Cryptographically random name; the extension is taken from the
          // allow-list check below, never from arbitrary user input.
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${randomBytes(16).toString('hex')}${ext}`);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();

        if (
          !ALLOWED_MIME_TYPES.includes(file.mimetype) ||
          !ALLOWED_EXTENSIONS.includes(ext)
        ) {
          return cb(
            new BadRequestException(
              'Only PNG, JPG, JPEG and WEBP image files are allowed',
            ),
            false,
          );
        }

        return cb(null, true);
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
