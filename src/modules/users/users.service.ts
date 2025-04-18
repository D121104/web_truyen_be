import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectModel } from '@nestjs/mongoose'
import { User } from '@/modules/users/schemas/user.schema'
import { Model } from 'mongoose'
import { hashPasswordHelper } from '@/utils/helper'
import bcrypt from 'bcryptjs'
import aqp from 'api-query-params'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { MailerService } from '@nestjs-modules/mailer'
import { IUser } from '@/modules/users/users.interface'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailerService: MailerService
  ) { }

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
    //check id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID')
    }

    return this.userModel.findById(id).select('-password')
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email })
  }

  async findByRefreshToken(refreshToken: string) {
    // Replace the following logic with your actual database query
    return await this.userModel.findOne({ refreshToken })
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
    const codeId = uuidv4()
    const user = await this.userModel.create({
      ...registerDto,
      password: hashedPassword,
      isActive: false,
      codeId: codeId,
      codeExpiredAt: dayjs().add(1, 'minute'),
    })

    //send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Activate your account', // Subject line
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: user.codeId,
      },
    })

    //return response
    return {
      _id: user._id,
    }
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    await this.userModel.updateOne({ _id }, { refreshToken })
  }

  async activeEmail(_id: string, codeId: string) {
    const user = await this.userModel.findById(_id)
    if (!user) {
      throw new BadRequestException('User not found')
    }

    //check if codeId is valid
    if (dayjs(user.codeExpiredAt).isBefore(dayjs())) {
      throw new BadRequestException('Code expired')
    }

    await this.userModel.updateOne(
      { codeId },
      { isActive: true, codeId: null, codeExpiredAt: null }
    )
  }

  async updateUserPassword(email: string, password: string) {
    const user = this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found')
    }
    const hashedPassword = await hashPasswordHelper(password)
    return await this.userModel.updateOne(
      { email },
      { password: hashedPassword }
    )
  }

  async forgotPassword(email: string) {
    const new_password = uuidv4()
    this.updateUserPassword(email, new_password)
    // this.mailerService.sendMail({
    //   to: email, // list of receivers
    //   subject: 'Reset Password', // Subject line
    //   template: 'register',
    //   context: {
    //     newPassword: new_password,
    //   },
    // })
    return {
      message: 'Reset password successfully',
    }
  }

  async changePassword(user: IUser, data) {
    const { password, newPassword } = data
    const userData = await this.userModel.findById(user._id)
    console.log(userData)
    const hashedPassword = await hashPasswordHelper(newPassword)
    if (await bcrypt.compare(password, userData.password)) {
      await this.userModel.updateOne(
        { _id: user._id },
        { password: hashedPassword }
      )
      return {
        message: 'Change password successfully',
      }
    } else {
      throw new BadRequestException('Password is incorrect')
    }

  }
}
