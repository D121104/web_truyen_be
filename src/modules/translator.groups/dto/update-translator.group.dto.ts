import { PartialType } from '@nestjs/mapped-types';
import { CreateTranslatorGroupDto } from './create-translator.group.dto';

export class UpdateTranslatorGroupDto extends PartialType(CreateTranslatorGroupDto) {}
