import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { UsersService } from '@/modules/users/users.service'
import { comparePasswordHelper, hashPasswordHelper } from '@/utils/helper'
import { JwtService } from '@nestjs/jwt'
import { CreateAuthDto } from '@/auth/dto/create-auth.dto'
import { IUser } from '@/modules/users/users.interface'
import { ConfigService } from '@nestjs/config'
import ms, { StringValue } from 'ms'
import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username)
    if (!user) {
      throw new UnauthorizedException('User not exist')
    }
    const isValidPassword = await comparePasswordHelper(pass, user.password)

    if (!user || !isValidPassword) return null

    return user
  }

  generateRefreshToken = (payload: any) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn:
        ms(this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN')) /
        1000,
    })

    return refreshToken
  }

  async login(user: any, res: Response) {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      name: user.name,
    }
    const refreshToken = this.generateRefreshToken(payload)
    const { _id, name, email, role } = user
    await this.usersService.updateUserToken(refreshToken, _id)

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge:
        ms(this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN')) *
        1000,
      sameSite: 'none',
    })
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        email,
        name,
        role,
      },
    }
  }

  async googleLogin(req: any, res: Response) {
    const { user } = req

    const isExistEmail = await this.usersService.findByEmail(user.email)
    let currentUser: any
    const newPassword = uuidv4()

    const hashedPassword = await hashPasswordHelper(newPassword)

    if (!isExistEmail) {
      currentUser = await this.usersService.create({
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        role: 'USER',
        password: hashedPassword,
        coin: 0,
        avatar: '',
        accountType: 'LOCAL',
        isActive: true,
        refreshToken: null,
        codeId: null,
        codeExpiredAt: null,
        books: [],
      })
    } else {
      const userName = user.firstName + ' ' + user.lastName
      await this.usersService.updateUserName(user.email, userName)

      currentUser = {
        email: isExistEmail.email,
        _id: isExistEmail._id,
        role: isExistEmail.role,
        name: user.firstName + ' ' + user.lastName,
      }
    }
    console.log('currentUser', currentUser)

    const refreshToken = this.generateRefreshToken(currentUser)
    const accessToken = this.jwtService.sign(currentUser, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn:
        ms(
          this.configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRED'
          ) as StringValue
        ) / 1000,
    })
    console.log('accessToken', accessToken)
    await this.usersService.updateUserToken(refreshToken, currentUser._id)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge:
        ms(
          this.configService.get<string>(
            'JWT_REFRESH_EXPIRES_IN'
          ) as StringValue
        ) * 1000,
      sameSite: 'none',
      secure: true,
    })

    return {
      access_token: accessToken,
    }
  }

  handleRegister = async (registerDto: CreateAuthDto) => {
    const userDto = {
      ...registerDto,
      coin: 0,
      avatar: '',
      accountType: 'LOCAL',
      isActive: false,
      refreshToken: null,
      codeId: null,
      codeExpiredAt: null,
      books: [],
      role: 'USER',
    }
    return await this.usersService.handleRegister(userDto)
  }

  async handleAccount(user: IUser) {
    return { user }
  }

  generateNewToken = async (refreshToken: string, res: Response) => {
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      })

      if (!payload) {
        throw new BadRequestException('Invalid refresh token')
      }

      // Find the user associated with the refresh token
      const user = await this.usersService.findByRefreshToken(refreshToken)
      if (!user) {
        throw new BadRequestException('User not found or invalid refresh token')
      }

      const { _id, name, email, role } = user

      // Create a new payload for the tokens
      const newPayload = {
        email: user.email,
        sub: user._id,
        role: user.role,
        name: user.name,
      }

      // Generate a new refresh token
      const newRefreshToken = this.generateRefreshToken(newPayload)

      // Update the user's refresh token in the database
      await this.usersService.updateUserToken(newRefreshToken, _id.toString())

      // Set the new refresh token as an HTTP-only cookie
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        maxAge:
          ms(this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN')) *
          1000,
        sameSite: 'none',
        secure: true,
      })

      // Return the new access token and user information
      return {
        access_token: this.jwtService.sign(newPayload, {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn:
            ms(
              this.configService.get<StringValue>('JWT_ACCESS_TOKEN_EXPIRED')
            ) / 1000,
        }),
        user: {
          _id,
          email,
          name,
          role,
        },
      }
    } catch (err) {
      throw new BadRequestException('Invalid refresh token')
    }
  }

  async logout(userId: string, res: Response) {
    {
      await this.usersService.updateUserToken(null, userId)
      res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      res.clearCookie('userId')
      return { message: 'Logout successfully' }
    }
  }

  async activeEmail(userId, codeId) {
    //check id
    if (!userId) {
      throw new BadRequestException('Invalid ID')
    }

    return await this.usersService.activeEmail(userId, codeId)
  }

  async forgotPassword(email: string) {
    //check email
    if (!email) {
      throw new BadRequestException('Invalid email')
    }

    return await this.usersService.forgotPassword(email)
  }
}
