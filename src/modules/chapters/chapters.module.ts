import { Module } from '@nestjs/common'
import { ChaptersService } from './chapters.service'
import { ChaptersController } from './chapters.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Chapter, ChapterSchema } from './schemas/chapter.schema'
import { BooksService } from '@/modules/books/books.service'
import { Book, BookSchema } from '@/modules/books/schemas/book.schema'
import { User, UserSchema } from '@/modules/users/schemas/user.schema'
import { UsersModule } from '@/modules/users/users.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chapter.name, schema: ChapterSchema },
      { name: Book.name, schema: BookSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService],
})
export class ChaptersModule {}
