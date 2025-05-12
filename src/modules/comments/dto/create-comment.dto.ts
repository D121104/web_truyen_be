import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateCommentDto {
  @IsNotEmpty()
  bookId: string

  @IsNotEmpty()
  content: string

  @IsOptional()
  parentId: string
}
