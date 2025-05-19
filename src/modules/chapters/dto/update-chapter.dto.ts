import { PartialType } from '@nestjs/mapped-types'
import { CreateChapterDto } from './create-chapter.dto'
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator'
import { Book } from '@/modules/books/schemas/book.schema'
import { User } from '@/modules/users/schemas/user.schema'
import { Type } from 'class-transformer'

export class ViewHistoryDto {
  @IsNotEmpty({ message: 'Date is required' })
  date: Date

  @IsNotEmpty({ message: 'Views is required' })
  views: number
}

export class UpdateChapterDto extends PartialType(CreateChapterDto) {
  @IsMongoId({ message: 'Invalid ID' })
  @IsNotEmpty({ message: 'ID is required' })
  _id: string

  @IsOptional()
  chapterNumber?: string

  @IsOptional()
  chapterTitle?: string

  @IsOptional()
  book?: Book

  @IsOptional()
  price?: number

  @IsOptional()
  status?: string

  @IsOptional()
  views?: number

  @IsOptional()
  users?: User[]

  @IsOptional()
  images?: string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ViewHistoryDto)
  viewsHistory?: ViewHistoryDto[]

  @IsOptional()
  createdAt?: Date

  @IsOptional()
  updatedAt?: Date
}
