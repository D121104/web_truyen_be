import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class BooksService {

  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<Book>,
  ) { }

  async create(createBookDto: CreateBookDto) {
    const book = await this.bookModel.create({
      ...createBookDto,
    })
    return {
      _id: book._id,
    };


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

    return { books, totalPages }
  }


  findOne(id: string) {
    //check id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    return this.bookModel.findById(id)
  }

  async update(updateBookDto: UpdateBookDto) {
    return await this.bookModel.updateOne(
      { _id: updateBookDto._id },
      updateBookDto)
  }

  async remove(id: string) {
    //check id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    return this.bookModel.deleteOne({ _id: id })
  }
}
