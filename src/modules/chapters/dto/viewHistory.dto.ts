import { IsNotEmpty } from 'class-validator'

export class ViewHistoryDto {
  @IsNotEmpty({ message: 'Date is required' })
  date: Date

  @IsNotEmpty({ message: 'Views is required' })
  views: number
}
