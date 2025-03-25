import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Chapter } from '@/modules/chapters/schemas/chapter.schema'

export type ChapterContentDocument = HydratedDocument<ChapterContent>

@Schema({ timestamps: true })
export class ChapterContent {
  @Prop()
  url: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' })
  chapter: Chapter
}

export const ChapterContentSchema = SchemaFactory.createForClass(ChapterContent)
