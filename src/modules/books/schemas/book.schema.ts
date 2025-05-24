import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Category } from '@/modules/categories/schemas/category.schema'
import { Chapter } from '@/modules/chapters/schemas/chapter.schema'
import { User } from '@/modules/users/schemas/user.schema'
import { TranslatorGroup } from '@/modules/translator.groups/schemas/translator.group.schema'

export type BookDocument = HydratedDocument<Book>

@Schema({ timestamps: true })
export class Book {
  @Prop()
  bookTitle: string

  @Prop()
  description: string

  @Prop()
  imgUrl: string

  @Prop()
  view: number

  @Prop()
  author: string

  @Prop()
  status: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  comments: Comment[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  categories: Category[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }] })
  chapters: Chapter[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  users: User[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TranslatorGroup' })
  translatorGroup: TranslatorGroup

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  likes: User[]
}

export const BookSchema = SchemaFactory.createForClass(Book)
