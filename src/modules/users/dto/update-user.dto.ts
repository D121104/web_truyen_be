import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateUserDto {
  @IsMongoId({ message: 'Invalid ID' })
  @IsNotEmpty({ message: 'ID is required' })
  _id: string

  @IsOptional()
  name: string

  @IsOptional()
  email: string

  @IsOptional()
  coin: number

  @IsOptional()
  avatar: string

  @IsOptional()
  books: string[]

  @IsOptional()
  role: string
}
