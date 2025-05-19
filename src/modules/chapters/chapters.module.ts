import { Module } from '@nestjs/common'
import { ChaptersService } from './chapters.service'
import { ChaptersController } from './chapters.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Chapter, ChapterSchema } from './schemas/chapter.schema'
import { BooksService } from '@/modules/books/books.service'
import { Book, BookSchema } from '@/modules/books/schemas/book.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chapter.name, schema: ChapterSchema },
      { name: Book.name, schema: BookSchema }, // <-- Thêm dòng này
    ]),
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService],
})
export class ChaptersModule {}
