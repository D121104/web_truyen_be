import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Book } from '@/modules/books/schemas/book.schema'

export type ChapterDocument = HydratedDocument<Chapter>

@Schema({ timestamps: true })
export class Chapter {
  @Prop()
  chapterNumber: string

  @Prop()
  chapterTitle: string

  @Prop()
  price: number

  @Prop()
  status: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Book' })
  book: Book

  @Prop()
  images: string[]
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter)
