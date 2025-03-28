import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common'
import { UploadService } from './upload.service'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { Public } from '@/decorator/customize'

@Controller('image')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return await this.uploadService.uploadImages(files)
  }
}
