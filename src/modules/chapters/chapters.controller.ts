import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common'
import { ChaptersService } from './chapters.service'
import { CreateChapterDto } from './dto/create-chapter.dto'
import { UpdateChapterDto } from './dto/update-chapter.dto'
import { Public } from '@/decorator/customize'

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Public()
  @Post()
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chaptersService.create(createChapterDto)
  }

  @Public()
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string
  ) {
    return this.chaptersService.findAll(query, +current, +pageSize)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(+id)
  }

  @Public()
  @Patch()
  update(@Body() updateChapterDto: UpdateChapterDto) {
    return this.chaptersService.update(updateChapterDto)
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chaptersService.remove(id)
  }
}
