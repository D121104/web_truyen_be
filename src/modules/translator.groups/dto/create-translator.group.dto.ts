import { IsNotEmpty } from 'class-validator'

export class CreateTranslatorGroupDto {
  @IsNotEmpty({ message: 'Group name is required' })
  groupName: string

  @IsNotEmpty({ message: 'Group description is required' })
  groupDescription: string

  @IsNotEmpty({ message: 'Group avatar is required' })
  groupImgUrl: string
}
