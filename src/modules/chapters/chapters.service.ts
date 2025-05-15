import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateChapterDto } from './dto/create-chapter.dto'
import { UpdateChapterDto } from './dto/update-chapter.dto'
import { Chapter } from '@/modules/chapters/schemas/chapter.schema'
import mongoose, { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import aqp from 'api-query-params'

@Injectable()
export class ChaptersService {
  constructor(
    @InjectModel(Chapter.name)
    private chapterModel: Model<Chapter>
  ) {}

  async create(createChapterDto: CreateChapterDto) {
    const chapter = this.chapterModel.create({
      ...createChapterDto,
    })
    return chapter
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query)
    if (filter.current) delete filter.current
    if (filter.pageSize) delete filter.pageSize

    if (!current) current = 1
    if (!pageSize) pageSize = 10

    const totalItems = (await this.chapterModel.find(filter)).length
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
    return await this.chapterModel.updateOne(
      { _id: updateChapterDto._id },
      updateChapterDto
    )
  }
  async remove(id: string) {
    //check id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    return this.chapterModel.deleteOne({ _id: id })
  }
}
