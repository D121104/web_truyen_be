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

    private readonly translatorGroupsService: TranslatorGroupsService
  ) {}

  async create(createBookDto: CreateBookDto) {
    const book = await this.bookModel.create({
      ...createBookDto,
    })
    return {
      _id: book._id,
    }
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
    limit: string,
    categoryId: string,
    status: string,
    period: 'day' | 'week' | 'month' | 'all'
  ) {
    const { filter, sort } = aqp(query)
    if (filter.current) delete filter.current
    if (filter.pageSize) delete filter.pageSize

    if (filter.categoryId) {
      filter.categories = { $in: [filter.categoryId] }
      delete filter.categoryId
    }

    if (filter.period) {
      delete filter.period
    }

    if (filter.status) {
      filter.status = { $in: [filter.status] }
    }

    if (!current) current = 1
    if (!pageSize) pageSize = 10

    const skip = (current - 1) * pageSize
    const chapterPopulateOptions: any = {
      sort: { createdAt: -1, chapterNumber: -1 },
    }
    if (limit !== 'all') {
      chapterPopulateOptions.limit = Number(limit) || 3
    }

    // Nếu không lọc theo period, dùng sort mặc định
    if (!period || period === 'all') {
      const totalItems = await this.bookModel.countDocuments(filter)
      const totalPages = Math.ceil(totalItems / pageSize)

      const books = await this.bookModel
        .find(filter)
        .skip(skip)
        .limit(pageSize)
        .sort(sort as any)
        .populate([
          {
            path: 'chapters',
            select: {
              _id: 1,
              chapterNumber: 1,
              chapterTitle: 1,
              price: 1,
              status: 1,
              updatedAt: 1,
              createdAt: 1,
              views: 1,
              viewsHistory: 1,
              users: 1,
            },
            options: chapterPopulateOptions,
          },
          {
            path: 'categories',
            select: {
              _id: 1,
              categoryName: 1,
              description: 1,
            },
          },
          {
            path: 'translatorGroup',
            select: {
              _id: 1,
              groupName: 1,
              groupDescription: 1,
            },
          },
        ])

      return {
        meta: {
          current,
          pageSize,
          pages: totalPages,
          total: totalItems,
        },
        result: books,
      }
    }

    // Nếu có lọc theo period (day/week/month)
    // 1. Lấy tất cả sách theo filter
    // 2. Tính tổng views theo period cho từng sách
    // 3. Sort theo tổng views giảm dần
    // 4. Trả về phân trang

    const now = new Date()
    // return {
    //   success: true,
    //   period: period,
    // }
    let startDate: Date | null = null
    if (period === 'day') {
      startDate = new Date()
      startDate.setDate(now.getDate() - 1)
    }
    if (period === 'week') {
      startDate = new Date()
      startDate.setDate(now.getDate() - 7)
    }
    if (period === 'month') {
      startDate = new Date()
      startDate.setMonth(now.getMonth() - 1)
    }

    // Lấy tất cả sách (không phân trang ở DB, phân trang ở FE)
    const allBooks = await this.bookModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort(sort as any)
      .populate([
        {
          path: 'chapters',
          select: {
            _id: 1,
            chapterNumber: 1,
            chapterTitle: 1,
            price: 1,
            status: 1,
            updatedAt: 1,
            createdAt: 1,
            views: 1,
            viewsHistory: 1,
            users: 1,
          },
          options: chapterPopulateOptions,
        },
        {
          path: 'categories',
          select: {
            _id: 1,
            categoryName: 1,
            description: 1,
          },
        },
        {
          path: 'translatorGroup',
          select: {
            _id: 1,
            groupName: 1,
            groupDescription: 1,
          },
        },
      ])

    // Tính tổng views theo period cho từng sách
    const booksWithViews = allBooks.map((book: any) => {
      let totalViews = 0
      if (book.chapters && Array.isArray(book.chapters)) {
        for (const chapter of book.chapters) {
          if (
            Array.isArray(chapter.viewsHistory) &&
            chapter.viewsHistory.length > 0
          ) {
            if (startDate) {
              totalViews += chapter.viewsHistory
                .filter((v) => new Date(v.date) >= startDate)
                .reduce((sum, v) => sum + v.views, 0)
            } else {
              totalViews += chapter.viewsHistory.reduce(
                (sum, v) => sum + v.views,
                0
              )
            }
          } else if (typeof chapter.views === 'number') {
            totalViews += chapter.views
          }
        }
      }
      return {
        ...book.toObject(),
        totalViews,
      }
    })

    // Sort theo totalViews giảm dần
    booksWithViews.sort((a, b) => b.totalViews - a.totalViews)

    // Phân trang ở đây
    const totalItems = booksWithViews.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const pagedBooks = booksWithViews.slice(skip, skip + pageSize)

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: pagedBooks,
    }
  }

  async findOne(id: string, limit: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }
    const chapterPopulateOptions: any = {
      sort: { updatedAt: 1 },
    }
    if (limit !== 'all') {
      chapterPopulateOptions.limit = Number(limit) || 3
    }

    return await this.bookModel.findById(id).populate([
      {
        path: 'chapters',
        select: {
          _id: 1,
          chapterNumber: 1,
          chapterTitle: 1,
          images: 1,
          price: 1,
          status: 1,
          updatedAt: 1,
          createdAt: 1,
          views: 1,
          viewsHistory: 1,
          users: 1,
        },
        options: chapterPopulateOptions,
      },
      {
        path: 'categories',
        select: {
          _id: 1,
          categoryName: 1,
          description: 1,
        },
      },
      {
        path: 'translatorGroup',
        select: {
          _id: 1,
          groupName: 1,
          groupDescription: 1,
        },
      },
    ])
  }

  async findManyByIds(ids: string[]) {
    if (!ids.length) {
      return {
        meta: { current: 1, pageSize: 10, total: 0, pages: 0 },
        result: [],
      }
    }
    const books = await this.bookModel.find({ _id: { $in: ids } }).populate([
      {
        path: 'chapters',
        select: {
          _id: 1,
          chapterNumber: 1,
          images: 1,
          viewsHistory: 1,
          createdAt: 1,
          views: 1,
          users: 1,
        },
        options: {
          sort: { createdAt: -1 },
        },
      },
      {
        path: 'translatorGroup',
        select: {
          _id: 1,
          groupName: 1,
          groupDescription: 1,
        },
      },
    ])

    // Tính totalViews và viewsDiff cho mỗi book
    const booksWithViews = books.map((book: any) => {
      let totalViews = 0
      let prevPeriodViews = 0

      // Xác định mốc thời gian cho tuần/tháng hiện tại và trước
      const now = new Date()

      // Ví dụ: tính cho tháng
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      )

      // Ví dụ: tính cho tuần (tính từ thứ 2)
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay() // CN là 7
      const startOfThisWeek = new Date(now)
      startOfThisWeek.setDate(now.getDate() - dayOfWeek + 1)
      const startOfLastWeek = new Date(startOfThisWeek)
      startOfLastWeek.setDate(startOfThisWeek.getDate() - 7)

      let thisPeriodViews = 0
      let lastPeriodViews = 0

      if (book.chapters && Array.isArray(book.chapters)) {
        for (const chapter of book.chapters) {
          if (
            Array.isArray(chapter.viewsHistory) &&
            chapter.viewsHistory.length > 0
          ) {
            // Tính cho tháng
            thisPeriodViews += chapter.viewsHistory
              .filter((v) => new Date(v.date) >= startOfThisMonth)
              .reduce((sum, v) => sum + v.views, 0)
            lastPeriodViews += chapter.viewsHistory
              .filter(
                (v) =>
                  new Date(v.date) >= startOfLastMonth &&
                  new Date(v.date) < startOfThisMonth
              )
              .reduce((sum, v) => sum + v.views, 0)

            // Nếu muốn tính cho tuần, thay startOfThisMonth/startOfLastMonth bằng startOfThisWeek/startOfLastWeek
            // thisPeriodViews += chapter.viewsHistory
            //   .filter((v) => new Date(v.date) >= startOfThisWeek)
            //   .reduce((sum, v) => sum + v.views, 0);
            // lastPeriodViews += chapter.viewsHistory
            //   .filter(
            //     (v) =>
            //       new Date(v.date) >= startOfLastWeek &&
            //       new Date(v.date) < startOfThisWeek
            //   )
            //   .reduce((sum, v) => sum + v.views, 0);

            // Tổng views toàn bộ
            totalViews += chapter.viewsHistory.reduce(
              (sum, v) => sum + v.views,
              0
            )
          } else if (typeof chapter.views === 'number') {
            totalViews += chapter.views
          }
        }
      }

      return {
        ...book.toObject(),
        totalViews,
        viewsDiff: thisPeriodViews - lastPeriodViews, // Số views chênh lệch so với kỳ trước
        thisPeriodViews,
        lastPeriodViews,
      }
    })

    return {
      meta: {
        current: 1,
        pageSize: booksWithViews.length,
        total: booksWithViews.length,
        pages: 1,
      },
      result: booksWithViews,
    }
  }

  async update(updateBookDto: UpdateBookDto) {
    return await this.bookModel.updateOne(
      { _id: updateBookDto._id },
      updateBookDto
    )
  }

  async remove(id: string) {
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

  async getTopBooksByViews(
    period: 'day' | 'week' | 'month' | 'all',
    limit = 10
  ) {
    const now = new Date()
    let startDate: Date | null = null
    if (period === 'day') {
      startDate = new Date()
      startDate.setDate(now.getDate() - 1)
    }
    if (period === 'week') {
      startDate = new Date()
      startDate.setDate(now.getDate() - 7)
    }
    if (period === 'month') {
      startDate = new Date()
      startDate.setMonth(now.getMonth() - 1)
    }
    // Nếu period là 'all', không cần lọc theo thời gian
    const books = await this.bookModel.find().populate({
      path: 'chapters',
      select: {
        views: 1,
        viewsHistory: 1,
        updatedAt: 1,
      },
    })

    const result = books.map((book: any) => {
      let totalViews = 0
      if (book.chapters && Array.isArray(book.chapters)) {
        for (const chapter of book.chapters) {
          // Nếu có viewsHistory thì tính theo lịch sử
          if (
            Array.isArray(chapter.viewsHistory) &&
            chapter.viewsHistory.length > 0
          ) {
            if (startDate) {
              // Lấy views theo period
              totalViews += chapter.viewsHistory
                .filter((v) => new Date(v.date) >= startDate)
                .reduce((sum, v) => sum + v.views, 0)
            } else {
              // Lấy tổng views toàn thời gian
              totalViews += chapter.viewsHistory.reduce(
                (sum, v) => sum + v.views,
                0
              )
            }
          } else if (typeof chapter.views === 'number') {
            // Nếu không có viewsHistory, fallback về tổng views hiện tại
            totalViews += chapter.views
          }
        }
      }
      return {
        ...book.toObject(),
        totalViews,
      }
    })

    return result.sort((a, b) => b.totalViews - a.totalViews).slice(0, limit)
  }
}
