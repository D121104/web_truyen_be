import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateChapterDto } from './dto/create-chapter.dto'
import { UpdateChapterDto } from './dto/update-chapter.dto'
import { Chapter } from '@/modules/chapters/schemas/chapter.schema'
import mongoose, { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import aqp from 'api-query-params'
import { Book } from '@/modules/books/schemas/book.schema'

@Injectable()
export class ChaptersService {
  constructor(
    @InjectModel(Chapter.name)
    private chapterModel: Model<Chapter>,
    @InjectModel(Book.name) // <-- Thêm dòng này
    private readonly bookModel: Model<Book>
  ) {}

  async create(createChapterDto: CreateChapterDto, bookId: string) {
    const chapter = await this.chapterModel.create({
      ...createChapterDto,
    })

    // Sau khi tạo chương, cập nhật book để thêm chương mới vào mảng chapters
    if (bookId) {
      await this.bookModel.findByIdAndUpdate(bookId, {
        $push: { chapters: chapter._id },
      })
    }

    return chapter
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query)
    if (filter.current) delete filter.current
    if (filter.pageSize) delete filter.pageSize

    if (!current) current = 1
    if (!pageSize) pageSize = 10

    const totalItems = await this.chapterModel.countDocuments(filter)
    const totalPages = Math.ceil(totalItems / pageSize)

    const skip = (current - 1) * pageSize

    const chapters = await this.chapterModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort(sort as any)

    const res = {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: chapters,
    }
    return res
  }

  async findOne(id: string) {
    // Kiểm tra tính hợp lệ của ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid chapter ID')
    }

    // Tìm chương trong cơ sở dữ liệu
    const chapter = await this.chapterModel.findById(id)

    // Nếu không tìm thấy chương, ném lỗi
    if (!chapter) {
      throw new BadRequestException('Chapter not found')
    }

    return chapter
  }

  async update(updateChapterDto: UpdateChapterDto) {
    const { _id, createdAt, updatedAt, ...updateData } = updateChapterDto

    // Nếu có cập nhật views, cập nhật viewsHistory
    if (typeof updateData.views === 'number') {
      const chapter = await this.chapterModel.findById(_id)
      if (chapter) {
        // Gán trực tiếp tổng views mới
        chapter.views = updateData.views

        // Xử lý viewsHistory
        const today = new Date()
        const todayStr = today.toISOString().slice(0, 10)
        let found = false
        if (!Array.isArray(chapter.viewsHistory)) chapter.viewsHistory = []
        for (const v of chapter.viewsHistory) {
          if (v.date && v.date.toISOString().slice(0, 10) === todayStr) {
            v.views += 1
            found = true
            break
          }
        }
        if (!found) {
          chapter.viewsHistory.push({ date: today, views: 1 })
        }

        // Cập nhật các trường khác nếu có
        Object.assign(chapter, updateData, {
          views: chapter.views,
          viewsHistory: chapter.viewsHistory,
        })

        // Update trực tiếp để tránh VersionError
        return await this.chapterModel.updateOne(
          { _id },
          {
            $set: {
              ...updateData,
              views: chapter.views,
              viewsHistory: chapter.viewsHistory,
            },
          }
        )
      }
    }

    // Nếu không cập nhật views, update bình thường
    return await this.chapterModel.updateOne(
      { _id: updateChapterDto._id },
      updateData
    )
  }

  async remove(id: string, bookId?: string) {
    // Xóa chương
    const result = await this.chapterModel.findByIdAndDelete(id)

    // Nếu có bookId, cập nhật lại book để xóa chương khỏi mảng chapters
    if (bookId) {
      await this.bookModel.findByIdAndUpdate(bookId, {
        $pull: { chapters: id },
      })
    }

    return result
  }
}
