import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common'
import { CreateOtpDto } from './dto/create-otp.dto'
import { UpdateOtpDto } from './dto/update-otp.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Otp, OtpDocument } from './schemas/otp.schema'

import crypto from 'crypto'
import { Model } from 'mongoose'
import { UsersService } from '../users/users.service'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class OtpsService {
  constructor(
    @InjectModel(Otp.name)
    private readonly otpModel: Model<OtpDocument>,
    @Inject(forwardRef(() => UsersService)) private userService: UsersService,

    private readonly mailService: MailerService
  ) {}

  async create(createOtpDto: CreateOtpDto) {
    const isExist = await this.userService.findByEmail(createOtpDto.email)
    if (!isExist) {
      throw new BadRequestException('User not found')
    }

    const existOtp = await this.otpModel.findOne({ email: createOtpDto.email })

    if (existOtp) {
      throw new BadRequestException('Otp already exist')
    }
    const otpToken = this.genarateToken()
    const newOtp = {
      token: otpToken,
      email: createOtpDto.email,
    }

    const result = await this.otpModel.create(newOtp)
    const linkVerify = `http://localhost:8080/api/users/password/forgot-password?token=${otpToken}`

    await this.mailService.sendMail({
      to: createOtpDto.email,
      from: 'Book Store',
      subject: 'Lấy lại mật khẩu',
      template: 'otp.template.hbs',
      context: {
        linkVerify: linkVerify,
      },
    })
    return result
  }

  genarateToken() {
    const token = crypto.randomInt(0, Math.pow(2, 32))
    return token
  }

  async checkToken(token: string) {
    const otp = await this.otpModel.findOne({ token: token }).lean().exec()
    if (!otp) {
      throw new BadRequestException('Token not found')
    }
    return otp
  }

  async remove(token: string) {
    await this.otpModel.deleteOne({ token: token })
  }
}
