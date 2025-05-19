import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateTranslatorGroupDto } from './dto/create-translator.group.dto'
import { UpdateTranslatorGroupDto } from './dto/update-translator.group.dto'
import { InjectModel } from '@nestjs/mongoose'
import { TranslatorGroup } from '@/modules/translator.groups/schemas/translator.group.schema'
import mongoose, { Model } from 'mongoose'
import aqp from 'api-query-params'
import { IUser } from '../users/users.interface'

@Injectable()
export class TranslatorGroupsService {
  constructor(
    @InjectModel(TranslatorGroup.name)
    private TranslatorGroupModel: Model<TranslatorGroup>
  ) {}

  async create(
    createTranslatorGroupDto: CreateTranslatorGroupDto,
    user: IUser
  ) {
    const isGroupNameExist = await this.isExistTranslatorGroup(
      createTranslatorGroupDto.groupName
    )
    if (isGroupNameExist) {
      throw new BadRequestException(
        'Translator group name already exists. Please choose another name.'
      )
    }

    const translatorGroup = this.TranslatorGroupModel.create({
      ...createTranslatorGroupDto,
      groupStatus: 'inactive',
      owner: user._id,
      users: [user._id],
    })
    return translatorGroup
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query)
    if (filter.current) delete filter.current
    if (filter.pageSize) delete filter.pageSize

    if (!current) current = 1
    if (!pageSize) pageSize = 10

    const totalItems = (await this.TranslatorGroupModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / pageSize)

    const skip = (current - 1) * pageSize

    const translatorGroups = await this.TranslatorGroupModel.find(filter)
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
      result: translatorGroups,
    }

    return res
  }

  async findByUser(
    query: string,
    current: number,
    pageSize: number,
    userId: string
  ) {
    const { filter, sort } = aqp(query)
    if (filter.current) delete filter.current
    if (filter.pageSize) delete filter.pageSize

    if (!current) current = 1
    if (!pageSize) pageSize = 10

    filter.users = userId

    const totalItems = (await this.TranslatorGroupModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / pageSize)

    const skip = (current - 1) * pageSize

    const groups = await this.TranslatorGroupModel.find({
      users: userId,
    })
      .limit(pageSize)
      .skip(skip)
      .populate({
        path: 'books',
        select: {
          _id: 1,
          bookTitle: 1,
          bookStatus: 1,
          description: 1,
          imgUrl: 1,
          author: 1,
          categories: 1,
          group: 1,
          status: 1,
        },
      })

    const res = {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: groups,
    }

    return res
  }

  async findByGroupId(groupId: string) {
    // Kiểm tra tính hợp lệ của groupId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      throw new BadRequestException('Invalid groupId')
    }

    // Tìm nhóm dịch theo groupId
    const group = await this.TranslatorGroupModel.findOne({
      _id: groupId,
    }).exec()

    // Nếu không tìm thấy, trả về lỗi
    if (!group) {
      throw new BadRequestException('Translator group not found')
    }

    return group
  }

  async findOne(id: string) {
    // Kiểm tra tính hợp lệ của id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    // Tìm nhóm dịch theo id
    const group = await this.TranslatorGroupModel.findOne({ _id: id }).exec()

    // Nếu không tìm thấy, trả về lỗi
    if (!group) {
      throw new BadRequestException('Translator group not found')
    }

    return group
  }

  async update(updateTranslatorGroupDto: UpdateTranslatorGroupDto) {
    return await this.TranslatorGroupModel.updateOne(
      { _id: updateTranslatorGroupDto._id },
      updateTranslatorGroupDto
    )
  }
  async remove(id: string) {
    //check id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    return this.TranslatorGroupModel.deleteOne({ _id: id })
  }

  async isExistTranslatorGroup(groupName: string) {
    const translatorGroup = await this.TranslatorGroupModel.exists({
      groupName: groupName,
    })
    return !!translatorGroup
  }
}
