import { PartialType } from '@nestjs/mapped-types'
import { CreateBookDto } from './create-book.dto'
import { Category } from '@/modules/categories/schemas/category.schema'
import { Chapter } from '@/modules/chapters/schemas/chapter.schema'
import { User } from '@/modules/users/schemas/user.schema'
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsMongoId({ message: 'Invalid ID' })
  @IsNotEmpty({ message: 'ID is required' })
  _id: string

  @IsOptional()
  bookTitle: string

  @IsOptional()
  description: string

  @IsOptional()
  imgUrl: string

  @IsOptional()
  views: number

  @IsOptional()
  author: string

  @IsOptional()
  status: string

  @IsOptional()
  categories: Category[]

  @IsOptional()
  chapters: Chapter[]

  @IsOptional()
  users: User[]

  @IsNotEmpty()
  translatorGroup: string
}
