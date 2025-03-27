import { IsEmail, IsNotEmpty } from 'class-validator'

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
  codeId: string
  codeExpiredAt: Date
  books: string[]
}
