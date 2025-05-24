import { IsNotEmpty } from 'class-validator'

export class BuyChapterDto {
  @IsNotEmpty({ message: 'Chapter ID is required' })
  chapterId: string

  @IsNotEmpty({ message: 'User ID is required' })
  userId: string
}
