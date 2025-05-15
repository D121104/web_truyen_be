import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Book } from './schemas/book.schema'
import mongoose, { Model } from 'mongoose'
import aqp from 'api-query-params'
import { TranslatorGroupsService } from '@/modules/translator.groups/translator.groups.service'

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<Book>,
    private readonly translatorGroupsService: TranslatorGroupsService // Đảm bảo TranslatorGroupsService được inject
  ) {}

  async create(createBookDto: CreateBookDto) {
    const book = await this.bookModel.create({
      ...createBookDto,
    })
    return {
      _id: book._id,
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query)
    if (filter.current) delete filter.current
    if (filter.pageSize) delete filter.pageSize

    if (!current) current = 1
    if (!pageSize) pageSize = 10

    const totalItems = (await this.bookModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / pageSize)

    const skip = (current - 1) * pageSize

    const books = await this.bookModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort(sort as any)
      .populate({
        path: 'chapters',
        select: {
          _id: 1,
          chapterNumber: 1,
          chapterTitle: 1,
          price: 1,
          status: 1,
          updatedAt: 1,
        },
        options: {
          sort: { chapterNumber: -1 },
          limit: 3,
        },
      })

    const res = {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: books,
    }

    return res
  }

  async findOne(id: string) {
    //check id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    return await this.bookModel.findById(id).populate({
      path: 'chapters',
      select: {
        _id: 1,
        chapterNumber: 1,
        chapterTitle: 1,
        price: 1,
        status: 1,
        updatedAt: 1,
      },
    })
  }

  async update(updateBookDto: UpdateBookDto) {
    return await this.bookModel.updateOne(
      { _id: updateBookDto._id },
      updateBookDto
    )
  }

  async remove(id: string) {
    //check id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    return this.bookModel.deleteOne({ _id: id })
  }

  async addBookToGroup(groupId: string, book: any) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      throw new BadRequestException('Invalid groupId')
    }

    const group = await this.translatorGroupsService.findByGroupId(groupId)
    if (!group) {
      throw new NotFoundException('Group not found')
    }

    group.books.push(book)
    await group.save()
  }
}
