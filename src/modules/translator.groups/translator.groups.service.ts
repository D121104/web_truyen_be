import { Injectable } from '@nestjs/common';
import { CreateTranslatorGroupDto } from './dto/create-translator.group.dto';
import { UpdateTranslatorGroupDto } from './dto/update-translator.group.dto';

@Injectable()
export class TranslatorGroupsService {
  create(createTranslatorGroupDto: CreateTranslatorGroupDto) {
    return 'This action adds a new translatorGroup';
  }

  findAll() {
    return `This action returns all translatorGroups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} translatorGroup`;
  }

  update(id: number, updateTranslatorGroupDto: UpdateTranslatorGroupDto) {
    return `This action updates a #${id} translatorGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} translatorGroup`;
  }
}
