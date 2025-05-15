import { IsArray, IsString } from 'class-validator'

export class GetChaptersDetailsDto {
  @IsArray()
  @IsString({ each: true })
  chapterIds: string[]
}
