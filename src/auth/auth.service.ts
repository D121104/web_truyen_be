import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '@/modules/users/users.service'
import { comparePasswordHelper } from '@/utils/helper'
import { JwtService } from '@nestjs/jwt'
import { CreateAuthDto } from '@/auth/dto/create-auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username)
    if (!user) {
      throw new UnauthorizedException("User not exist")
    }
    const isValidPassword = await comparePasswordHelper(pass, user.password)

    if (!user || !isValidPassword) return null

    return user
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user._id }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  handleRegister = async (registerDto: CreateAuthDto) => {
    const userDto = {
      ...registerDto,
      coin: 0,
      avatar: '',
      codeId: null,
      codeExpiredAt: null,
      books: [],
    }
    return await this.usersService.handleRegister(userDto)
  }
}
