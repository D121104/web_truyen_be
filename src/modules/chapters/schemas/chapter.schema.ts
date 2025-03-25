import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { ChapterContent } from '@/modules/chapter.contents/schemas/chapter.content.schema'
import { Book } from '@/modules/books/schemas/book.schema'

export type ChapterDocument = HydratedDocument<Chapter>

@Schema({ timestamps: true })
export class Chapter {
  @Prop()
  chapter_title: string

  @Prop()
  price: number

  @Prop()
  status: string

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChapterContent' }],
  })
  chapter_contents: ChapterContent[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Book' })
  book: Book
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter)
