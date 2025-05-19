import { PartialType } from '@nestjs/mapped-types'
import { CreateCategoryDto } from './create-category.dto'
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'
import { Book } from '@/modules/books/schemas/book.schema'

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsMongoId({ message: 'Invalid ID' })
  @IsNotEmpty({ message: 'ID is required' })
  _id: string

  @IsOptional()
  categoryName: string

  @IsOptional()
  description: string

  @IsOptional()
  books: Book[]
}
