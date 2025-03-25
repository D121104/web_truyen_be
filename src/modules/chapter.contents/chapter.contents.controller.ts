import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { ChapterContentsService } from './chapter.contents.service'
import { CreateChapterContentDto } from './dto/create-chapter.content.dto'
import { UpdateChapterContentDto } from './dto/update-chapter.content.dto'

@Controller('chapter.contents')
export class ChapterContentsController {
  constructor(
    private readonly chapterContentsService: ChapterContentsService
  ) {}

  @Post()
  create(@Body() createChapterContentDto: CreateChapterContentDto) {
    return this.chapterContentsService.create(createChapterContentDto)
  }

  @Get()
  findAll() {
    return this.chapterContentsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chapterContentsService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChapterContentDto: UpdateChapterContentDto
  ) {
    return this.chapterContentsService.update(+id, updateChapterContentDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chapterContentsService.remove(+id)
  }
}
