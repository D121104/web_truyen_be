import { Category } from '@/modules/categories/schemas/category.schema'
import { TranslatorGroup } from '@/modules/translator.groups/schemas/translator.group.schema'
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

  @IsNotEmpty()
  categories: Category[]

  @IsNotEmpty()
  translatorGroup: string

  @IsNotEmpty()
  status: string
}
