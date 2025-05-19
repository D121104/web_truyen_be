import { IsNotEmpty } from 'class-validator'

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Category Name is required' })
  categoryName: string

  @IsNotEmpty({ message: 'Description is required' })
  description: string
}
