import { Injectable } from '@nestjs/common'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { UploadApiErrorResponse } from 'cloudinary'

@Injectable()
export class UploadService {
  async uploadImages(
    files: Express.Multer.File[] | Express.Multer.File
  ): Promise<string[]> {
    const uploadPromises = (Array.isArray(files) ? files : [files]).map(
      (file) => {
        return new Promise<UploadApiResponse | UploadApiErrorResponse>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: 'web_truyen' }, (error, result) => {
                if (error) return reject(error)
                resolve(result)
              })
              .end(file.buffer)
          }
        )
      }
    )

    // Wait for all uploads to complete and maintain the order
    const results = await Promise.all(uploadPromises)
    return results.map((result) => (result as UploadApiResponse).secure_url)
  }
}
