import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Category } from '@/modules/categories/schemas/category.schema'
import mongoose, { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import aqp from 'api-query-params'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const isCategoryExist = await this.isCategoryExist(
      createCategoryDto.categoryName
    )

    if (isCategoryExist) {
      throw new BadRequestException('Category already exist')
    }

    const category = await this.categoryModel.create({
      ...createCategoryDto,
    })
    return {
      _id: category._id,
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query)
    if (filter.current) delete filter.current
    if (filter.pageSize) delete filter.pageSize

    if (!current) current = 1
    if (!pageSize) pageSize = 10

    const totalItems = (await this.categoryModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / pageSize)

    const skip = (current - 1) * pageSize

    const categories = await this.categoryModel
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
      result: categories,
    }
    return res
  }

  async findOne(id: string) {
    //check id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    return this.categoryModel.findById(id)
  }

  async update(uppdateCategoryDto: UpdateCategoryDto) {
    return await this.categoryModel.updateOne(
      { _id: uppdateCategoryDto._id },
      uppdateCategoryDto
    )
  }

  async remove(id: string) {
    //check id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    return this.categoryModel.deleteOne({ _id: id })
  }

  isCategoryExist = async (categoryName: string) => {
    const category = await this.categoryModel.exists({ categoryName })
    return !!category
  }
}
