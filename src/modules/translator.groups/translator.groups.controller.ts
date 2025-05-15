import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common'
import { TranslatorGroupsService } from './translator.groups.service'
import { CreateTranslatorGroupDto } from './dto/create-translator.group.dto'
import { UpdateTranslatorGroupDto } from './dto/update-translator.group.dto'
import { Public } from '@/decorator/customize'

@Controller('translator.groups')
export class TranslatorGroupsController {
  constructor(
    private readonly translatorGroupsService: TranslatorGroupsService
  ) {}

  @Post()
  create(
    @Body() createTranslatorGroupDto: CreateTranslatorGroupDto,
    @Request() req: any
  ) {
    return this.translatorGroupsService.create(
      createTranslatorGroupDto,
      req.user
    )
  }

  @Public()
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string
  ) {
    return this.translatorGroupsService.findAll(query, +current, +pageSize)
  }

  @Get('/groups/by-user')
  async findByUser(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Request() req: any
  ) {
    return await this.translatorGroupsService.findByUser(
      query,
      +current,
      +pageSize,
      req.user._id
    )
  }

  @Public()
  @Get('/group/:groupId')
  async findByGroupId(@Param('groupId') groupId: string) {
    return await this.translatorGroupsService.findByGroupId(groupId)
  }

  @Public()
  @Patch()
  update(@Body() updateTranslatorGroupDto: UpdateTranslatorGroupDto) {
    return this.translatorGroupsService.update(updateTranslatorGroupDto)
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.translatorGroupsService.remove(id)
  }
}
