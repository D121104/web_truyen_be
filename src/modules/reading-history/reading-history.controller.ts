import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
} from '@nestjs/common'
import { ReadingHistoryService } from './reading-history.service'

@Controller('reading-history')
export class ReadingHistoryController {
  constructor(private readonly readingHistoryService: ReadingHistoryService) {}

  @Post()
  async create(
    @Body()
    body: {
      userId: string
      bookId: string
      chapterId: string
      time?: number
    }
  ) {
    return this.readingHistoryService.saveReadingHistory(
      body.userId,
      body.bookId,
      body.chapterId,
      body.time
    )
  }

  @Get()
  async findAll(@Query('userId') userId: string, @Query('limit') limit = 20) {
    return this.readingHistoryService.getReadingHistory(userId, Number(limit))
  }

  @Delete(':userId')
  async deleteReadingHistory(
    @Param('userId') userId: string,
    @Body('bookId') bookId: string
  ) {
    return this.readingHistoryService.deleteReadingHistoryByBook(userId, bookId)
  }
}
