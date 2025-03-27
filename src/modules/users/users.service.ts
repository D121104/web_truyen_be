import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectModel } from '@nestjs/mongoose'
import { User } from '@/modules/users/schemas/user.schema'
import { Model } from 'mongoose'
import { hashPasswordHelper } from '@/utils/helper'
import aqp from 'api-query-params'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email })
    return !!user
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto

    //check if email exist
    const isEmailExist = await this.isEmailExist(email)
    if (isEmailExist) {
      throw new BadRequestException('Email already exist')
    }

    //hash password
    const hashedPassword = await hashPasswordHelper(password)
    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    })
    return {
      _id: user._id,
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query)
    if (filter.current) delete filter.current
    if (filter.pageSize) delete filter.pageSize

    if (!current) current = 1
    if (!pageSize) pageSize = 10

    const totalItems = (await this.userModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / pageSize)

    const skip = (current - 1) * pageSize

    const users = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .select('-password')
      .sort(sort as any)

    return { users, totalPages }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email })
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      updateUserDto
    )
  }

  async remove(id: string) {
    //check id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    return this.userModel.deleteOne({ _id: id })
  }

  async handleRegister(registerDto: CreateUserDto) {
    const { name, email, password } = registerDto

    //check if email exist
    const isEmailExist = await this.isEmailExist(email)
    if (isEmailExist) {
      throw new BadRequestException('Email already exist')
    }

    //hash password
    const hashedPassword = await hashPasswordHelper(password)
    const user = await this.userModel.create({
      ...registerDto,
      password: hashedPassword,
      isActive: false,
      codeId: uuidv4(),
      codeExpiredAt: dayjs().add(1, 'minute'),
    })

    //return response
    return {
      _id: user._id,
    }

    //send email
  }
}
