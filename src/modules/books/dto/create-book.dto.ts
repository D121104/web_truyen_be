import { IsNotEmpty } from 'class-validator'

export class CreateBookDto {
  @IsNotEmpty()
  bookTitle: string

  @IsNotEmpty()
  description: string

  @IsNotEmpty()
  imgUrl: string

  @IsNotEmpty()
  author: string
}
