import { Module } from '@nestjs/common'
import { ReadingHistoryService } from './reading-history.service'
import { ReadingHistoryController } from './reading-history.controller'
import { BooksService } from '@/modules/books/books.service'
import { ChaptersService } from '@/modules/chapters/chapters.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Book, BookSchema } from '@/modules/books/schemas/book.schema'
import {
  Chapter,
  ChapterSchema,
} from '@/modules/chapters/schemas/chapter.schema'
import { BooksModule } from '@/modules/books/books.module'
import { TranslatorGroupsModule } from '@/modules/translator.groups/translator.groups.module'
import { ChaptersModule } from '@/modules/chapters/chapters.module'

@Module({
  imports: [
    BooksModule,
    TranslatorGroupsModule,
    ChaptersModule,
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    MongooseModule.forFeature([{ name: Chapter.name, schema: ChapterSchema }]),
  ],
  controllers: [ReadingHistoryController],
  providers: [ReadingHistoryService, BooksService, ChaptersService],
})
export class ReadingHistoryModule {}
