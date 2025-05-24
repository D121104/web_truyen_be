import { forwardRef, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './schemas/user.schema'
import { OtpsModule } from '../otps/otps.module'
import { Book, BookSchema } from '@/modules/books/schemas/book.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Book.name, schema: BookSchema },
    ]),
    forwardRef(() => OtpsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, UsersModule, MongooseModule],
})
export class UsersModule {}
