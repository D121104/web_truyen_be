import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common'
import { BooksService } from './books.service'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { Public } from '@/decorator/customize'

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Public()
  @Post()
  async create(
    @Body() createBookDto: CreateBookDto,
    @Query('groupId') groupId: string
  ) {
    if (!groupId) {
      throw new BadRequestException('groupId is required')
    }
    createBookDto.translatorGroup = groupId

    // Tạo sách mới
    const book = await this.booksService.create(createBookDto)

    // Thêm sách vào nhóm
    await this.booksService.addBookToGroup(groupId, book)

    return book
  }

  @Public()
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('limit') limit: string,
    @Query('categoryId') categoryId: string,
    @Query('status') status: string,
    @Query('period') period: 'day' | 'week' | 'month' | 'all' = 'day'
  ) {
    return this.booksService.findAll(
      query,
      +current,
      +pageSize,
      limit,
      categoryId,
      status,
      period
    )
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @Query('limit') limit: string) {
    return this.booksService.findOne(id, limit)
  }

  @Public()
  @Patch()
  update(@Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(updateBookDto)
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id)
  }

  @Post('many')
  async getBooksByIdsPost(@Body('ids') ids: string[]) {
    return this.booksService.findManyByIds(ids)
  }

  @Public()
  @Post('top')
  async getTopBooks(
    @Query('period') period: 'day' | 'week' | 'month' | 'all' = 'day',
    @Query('limit') limit: number = 10
  ) {
    return this.booksService.getTopBooksByViews(period, Number(limit))
  }

  @Post('like/:id')
  async likeBook(@Param('id') bookId: string, @Body('userId') userId: string) {
    return this.booksService.likeBook(bookId, userId)
  }

  @Post('unlike/:id')
  async unlikeBook(
    @Param('id') bookId: string,
    @Body('userId') userId: string
  ) {
    return this.booksService.unlikeBook(bookId, userId)
  }
}
