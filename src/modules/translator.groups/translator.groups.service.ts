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

  async findOne(id: number) {
    return `This action returns a #${id} translatorGroup`
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
