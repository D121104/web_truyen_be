import { forwardRef, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './schemas/user.schema'
import { OtpsModule } from '../otps/otps.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => OtpsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, UsersModule],
})
export class UsersModule {}
