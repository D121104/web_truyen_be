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
import { BooksService } from './books.service'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { Public } from '@/decorator/customize'

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Public()
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto)
  }

  @Public()
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string
  ) {
    return this.booksService.findAll(query, +current, +pageSize)
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id)
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
}
