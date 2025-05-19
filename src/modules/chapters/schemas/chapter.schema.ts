import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Book } from '@/modules/books/schemas/book.schema'
import { User } from '@/modules/users/schemas/user.schema'

export type ChapterDocument = HydratedDocument<Chapter>

@Schema({ timestamps: true })
export class Chapter {
  @Prop()
  chapterNumber: string

  @Prop({ default: '' })
  chapterTitle: string

  @Prop()
  price: number

  @Prop()
  status: string

  @Prop({ default: 0 })
  views: number

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] })
  users: mongoose.Types.ObjectId[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Book' })
  book: Book

  @Prop()
  images: string[]

  @Prop({
    type: [
      {
        date: { type: Date, required: true },
        views: { type: Number, required: true, default: 0 },
      },
    ],
    default: [],
  })
  viewsHistory: { date: Date; views: number }[]
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter)
