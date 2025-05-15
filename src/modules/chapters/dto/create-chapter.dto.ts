// import { Book } from '@/modules/books/schemas/book.schema'
import { IsNotEmpty } from 'class-validator'

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
}
