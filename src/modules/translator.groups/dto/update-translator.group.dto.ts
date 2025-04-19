import { PartialType } from '@nestjs/mapped-types'
import { CreateTranslatorGroupDto } from './create-translator.group.dto'
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'
import { User } from '@/modules/users/schemas/user.schema'
import { Book } from '@/modules/books/schemas/book.schema'

export class UpdateTranslatorGroupDto extends PartialType(
  CreateTranslatorGroupDto
) {
  @IsMongoId({ message: 'Invalid ID' })
  @IsNotEmpty({ message: 'ID is required' })
  _id: string

  @IsOptional()
  groupName: string

  @IsOptional()
  groupDescription: string

  @IsOptional()
  groupImgUrl: string

  @IsOptional()
  groupStatus: string

  @IsOptional()
  users: User[]

  @IsOptional()
  books: Book[]
}
