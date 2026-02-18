import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'profile_pictures',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    console.log(`[CloudinaryService] Starting upload for ${file.originalname} (${file.size} bytes)`);
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('[CloudinaryService] Upload error:', error.message);
            return reject(new Error(error.message));
          }
          if (!result) {
            console.error('[CloudinaryService] Result undefined');
            return reject(new Error('Cloudinary upload result is undefined'));
          }
          console.log('[CloudinaryService] Upload success:', result.secure_url);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}
