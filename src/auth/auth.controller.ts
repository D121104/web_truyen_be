import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
  Req,
  BadRequestException,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/create-auth.dto'
import { UpdateAuthDto } from './dto/update-auth.dto'
import { AuthGuard } from '@nestjs/passport'
import { LocalAuthGuard } from '@/auth/passport/local-auth.guard'
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard'
import { Public } from '@/decorator/customize'
import { MailerService } from '@nestjs-modules/mailer'
import { Request as ExpressRequest, Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req) {
    return this.authService.login(req.user, req.res)
  }

  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto)
  }

  // @Get('mail')
  // @Public()
  // testMail() {
  //   this.mailerService
  //     .sendMail({
  //       to: 'ducduydao12112004@gmail.com', // list of receivers
  //       subject: 'Testing Nest MailerModule ✔', // Subject line
  //       text: 'welcome', // plaintext body
  //       template: 'register',
  //       context: {
  //         name: 'test',
  //         activationCode: 123456789,
  //       },
  //     })
  //     .then(() => {})
  //     .catch(() => {})
  //   return 'ok'
  // }

  @Get('/refresh')
  handleRefresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refresh_token']
    if (!refreshToken) {
      throw new BadRequestException('Token không hợp lệ!')
    }

    return this.authService.generateNewToken(refreshToken, res)
  }
}
