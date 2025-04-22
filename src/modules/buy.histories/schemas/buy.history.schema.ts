import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { User } from '@/modules/users/schemas/user.schema'
// import { Book } from '@/modules/books/schemas/book.schema'
import { Chapter } from '@/modules/chapters/schemas/chapter.schema'

export type BuyHistoryDocument = HydratedDocument<BuyHistory>

@Schema({ timestamps: true })
export class BuyHistory {
  @Prop()
  note: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' })
  chapter: Chapter

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  user: User
}

export const BuyHistorySchema = SchemaFactory.createForClass(BuyHistory)
