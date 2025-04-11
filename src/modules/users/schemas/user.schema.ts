import { Book } from '@/modules/books/schemas/book.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string

  @Prop()
  email: string

  @Prop()
  password: string

  @Prop({ default: 'USER' })
  role: string

  @Prop({ default: 0 })
  coin: number

  @Prop()
  avatar: string

  @Prop({ default: 'LOCAL' })
  accountType: string

  @Prop({ default: false })
  isActive: boolean

  @Prop()
  refreshToken: string

  @Prop()
  codeId: string

  @Prop()
  codeExpiredAt: Date

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }] })
  books: Book[]
}

export const UserSchema = SchemaFactory.createForClass(User)
