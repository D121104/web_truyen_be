import { IsEmail, IsNotEmpty } from 'class-validator'

export class ChangePasswordUserDto {
    @IsNotEmpty()
    password: string

    @IsNotEmpty()
    newPassword: string

}
