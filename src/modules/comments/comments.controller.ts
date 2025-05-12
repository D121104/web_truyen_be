import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  Req,
  Request,
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { IUser } from '../users/users.interface'
import { Public } from '@/decorator/customize'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user)
  }

  @Public()
  @Get()
  findAll(@Query() qs: string) {
    return this.commentsService.findAll(qs)
  }

  @Public()
  @Get('/by-book/:bookId')
  findByCompany(@Param('bookId') bookId: string, @Query() qs: string) {
    return this.commentsService.findByBook(bookId, qs)
  }

  @Public()
  @Get('/parent/:parentId')
  findByParent(@Param('parentId') parentId: string, @Query() qs: string) {
    return this.commentsService.findByParent(parentId, qs)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.commentsService.remove(id, req.user)
  }
}
