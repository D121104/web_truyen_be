import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { OtpsService } from './otps.service'
import { CreateOtpDto } from './dto/create-otp.dto'
import { UpdateOtpDto } from './dto/update-otp.dto'
import { Public } from '@/decorator/customize'

@Controller('otps')
export class OtpsController {
  constructor(private readonly otpsService: OtpsService) {}

  @Public()
  @Post()
  create(@Body() createOtpDto: CreateOtpDto) {
    return this.otpsService.create(createOtpDto)
  }
}
