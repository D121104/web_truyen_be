import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'

export type OtpDocument = HydratedDocument<Otp>

@Schema({ timestamps: true })
export class Otp {
  @Prop()
  email: string

  @Prop()
  token: string

  @Prop()
  updatedAt: Date

  @Prop()
  createdAt: Date

  @Prop({ type: Date, default: Date.now, expires: '10m' })
  expiredAt: Date
}

export const OtpSchema = SchemaFactory.createForClass(Otp)
