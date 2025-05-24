import { Module } from '@nestjs/common'
import { BooksService } from './books.service'
import { BooksController } from './books.controller'
import { Book, BookSchema } from './schemas/book.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { TranslatorGroupsModule } from '@/modules/translator.groups/translator.groups.module'
import { User, UserSchema } from '@/modules/users/schemas/user.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TranslatorGroupsModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
