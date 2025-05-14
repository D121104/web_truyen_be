import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string

  coin: number
  avatar: string
  accountType: string
  isActive: boolean
  refreshToken: string
  codeId: string
  codeExpiredAt: Date
  books: string[]

  @IsOptional()
  role: string
}
