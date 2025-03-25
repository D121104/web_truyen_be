import { PartialType } from '@nestjs/mapped-types';
import { CreateChapterContentDto } from './create-chapter.content.dto';

export class UpdateChapterContentDto extends PartialType(CreateChapterContentDto) {}
