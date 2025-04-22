import { PartialType } from '@nestjs/mapped-types'
import { CreateChapterDto } from './create-chapter.dto'
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'
import { Book } from '@/modules/books/schemas/book.schema'

export class UpdateChapterDto extends PartialType(CreateChapterDto) {
  @IsMongoId({ message: 'Invalid ID' })
  @IsNotEmpty({ message: 'ID is required' })
  _id: string

  @IsOptional()
  chapterTitle: string

  @IsOptional()
  book: Book

  @IsOptional()
  price: number

  @IsOptional()
  status: string

  @IsOptional()
  images: string[]
}
