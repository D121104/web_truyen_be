import { Book } from '@/modules/books/schemas/book.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
  @Prop()
  username: string

  @Prop()
  email: string

  @Prop()
  password: string

  @Prop()
  role: string

  @Prop()
  coin: number

  @Prop()
  avatar: string

  @Prop()
  account_type: string

  @Prop()
  is_active: boolean

  @Prop()
  code_id: string

  @Prop()
  code_expired_at: Date

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }] })
  books: Book[]
}

export const UserSchema = SchemaFactory.createForClass(User)
