import { Book } from '@/modules/books/schemas/book.schema'
import { User } from '@/modules/users/schemas/user.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'

export type TranslatorGroupDocument = HydratedDocument<TranslatorGroup>

@Schema({ timestamps: true })
export class TranslatorGroup {
  @Prop()
  groupName: string

  @Prop()
  groupDescription: string

  @Prop()
  groupImgUrl: string

  @Prop()
  groupStatus: string

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  users: User[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Book' })
  books: Book[]
}

export const TranslatorGroupSchema =
  SchemaFactory.createForClass(TranslatorGroup)
