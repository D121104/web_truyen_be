// import { Book } from '@/modules/books/schemas/book.schema'
import { ViewHistoryDto } from '@/modules/chapters/dto/viewHistory.dto'
import { User } from '@/modules/users/schemas/user.schema'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator'

export class CreateChapterDto {
  @IsNotEmpty({ message: 'Chapter title is required' })
  chapterNumber: string

  @IsNotEmpty({ message: 'Chapter title is required' })
  chapterTitle: string

  @IsNotEmpty({ message: 'Price is required' })
  price: number

  @IsNotEmpty({ message: 'Status is required' })
  status: string

  @IsNotEmpty({ message: 'Images is required' })
  images: string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ViewHistoryDto)
  viewsHistory?: ViewHistoryDto[]

  users: User[]
}
