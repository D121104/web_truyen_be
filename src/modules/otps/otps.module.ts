import { forwardRef, Module } from '@nestjs/common'
import { OtpsService } from './otps.service'
import { OtpsController } from './otps.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Otp, OtpSchema } from './schemas/otp.schema'
import { UsersModule } from '../users/users.module'
import { MailerModule } from '@nestjs-modules/mailer'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    forwardRef(() => UsersModule),
    MailerModule,
  ],
  controllers: [OtpsController],
  providers: [OtpsService],
  exports: [OtpsService, OtpsModule],
})
export class OtpsModule {}
