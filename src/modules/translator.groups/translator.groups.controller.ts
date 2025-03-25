import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TranslatorGroupsService } from './translator.groups.service';
import { CreateTranslatorGroupDto } from './dto/create-translator.group.dto';
import { UpdateTranslatorGroupDto } from './dto/update-translator.group.dto';

@Controller('translator.groups')
export class TranslatorGroupsController {
  constructor(private readonly translatorGroupsService: TranslatorGroupsService) {}

  @Post()
  create(@Body() createTranslatorGroupDto: CreateTranslatorGroupDto) {
    return this.translatorGroupsService.create(createTranslatorGroupDto);
  }

  @Get()
  findAll() {
    return this.translatorGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.translatorGroupsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTranslatorGroupDto: UpdateTranslatorGroupDto) {
    return this.translatorGroupsService.update(+id, updateTranslatorGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.translatorGroupsService.remove(+id);
  }
}
