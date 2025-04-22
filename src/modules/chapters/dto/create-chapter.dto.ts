// import { Book } from '@/modules/books/schemas/book.schema'
import { IsNotEmpty } from 'class-validator'

export class CreateChapterDto {
  @IsNotEmpty({ message: 'Chapter title is required' })
  chapterTitle: string

  //   @IsNotEmpty()
  //   book: Book

  @IsNotEmpty({ message: 'Images is required' })
  images: string[]
}
