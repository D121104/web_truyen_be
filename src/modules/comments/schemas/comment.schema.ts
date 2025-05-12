import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
export type CommentDocument = HydratedDocument<Comment>

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: mongoose.Schema.Types.ObjectId

  @Prop()
  content: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  })
  book: mongoose.Schema.Types.ObjectId

  @Prop({ default: 0 })
  left: number

  @Prop({ default: 0 })
  right: number

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Comment.name,
  })
  parentId: mongoose.Schema.Types.ObjectId

  @Prop()
  updatedAt: Date

  @Prop()
  createdAt: Date
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
