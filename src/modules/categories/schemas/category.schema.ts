import { Book } from '@/modules/books/schemas/book.schema'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'

export type CategoryDocument = HydratedDocument<Category>

@Schema({ timestamps: true })
export class Category {
  @Prop()
  categoryName: string

  @Prop()
  description: string

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }] })
  books: Book[]
}

export const CategorySchema = SchemaFactory.createForClass(Category)
