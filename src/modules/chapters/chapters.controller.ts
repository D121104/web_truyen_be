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
import { BuyChapterDto } from '@/modules/chapters/dto/buy-chapter.dto'

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  async create(
    @Body() createChapterDto: CreateChapterDto,
    @Query('bookId') bookId: string
  ) {
    return this.chaptersService.create(createChapterDto, bookId)
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

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(id)
  }

  @Public()
  @Patch()
  update(@Body() updateChapterDto: UpdateChapterDto) {
    return this.chaptersService.update(updateChapterDto)
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string, @Query('bookId') bookId: string) {
    return this.chaptersService.remove(id, bookId)
  }

  @Public()
  @Post('buy')
  buyChapter(@Body() BuyChapterDto: BuyChapterDto) {
    return this.chaptersService.buyChapter(BuyChapterDto)
  }
}
