import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common'
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
import { OtpsService } from '../otps/otps.service'
import { Book } from '@/modules/books/schemas/book.schema'

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => OtpsService))
    private readonly otpService: OtpsService,

    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly mailerService: MailerService,
    @InjectModel('Book')
    private readonly bookModel: Model<Book> // Replace 'any' with your actual Book model type
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
      email: user.email,
      name: user.name,
      role: user.role,
      coin: user.coin,
    }
  }

  async addCoin(userId: string, coin: number) {
    return await this.userModel.updateOne(
      {
        _id: userId,
      },
      {
        $inc: {
          coin: coin,
        },
      }
    )
  }

  async updateUserName(email: string, name: string) {
    return await this.userModel.updateOne(
      {
        email: email,
      },
      {
        $set: {
          name: name,
        },
      }
    )
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

    const res = {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: users,
    }

    return res
  }

  findOne(id: string) {
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
      isActive: true,
      codeId: codeId,
      codeExpiredAt: dayjs().add(1, 'minute'),
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
    const user = this.findByEmail(email)
    if (!user) {
      throw new BadRequestException('User not found')
    }
    const hashedPassword = await hashPasswordHelper(password)
    return await this.userModel.updateOne(
      { email },
      { password: hashedPassword }
    )
  }

  async forgotPassword(token: string) {
    const user = await this.otpService.checkToken(token)

    if (!user) {
      throw new BadRequestException('Token not found!')
    }

    const existUser = await this.findByEmail(user.email)
    if (!existUser) {
      throw new BadRequestException('User not found!')
    }

    const newPassword = uuidv4()

    const passwordHash = await hashPasswordHelper(newPassword)
    await this.userModel.updateOne(
      { email: user.email },
      { password: passwordHash }
    )
    await this.otpService.remove(token)
    await this.mailerService.sendMail({
      to: user.email,
      from: 'Book Store',
      subject: 'Mật khẩu mới của bạn',
      template: 'reset-password.template.hbs',
      context: {
        password: newPassword,
      },
    })
    return true
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

  async unfollowBook(userId: string, bookId: string) {
    await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { books: bookId } },
      { new: true }
    )

    await this.bookModel.findOneAndUpdate(
      { _id: bookId },
      { $pull: { users: userId } },
      { new: true }
    )

    return await this.userModel.findById(userId)
  }

  async followBook(userId: string, bookId: string) {
    await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { books: bookId } },
      { new: true }
    )

    await this.bookModel.findOneAndUpdate(
      { _id: bookId },
      { $addToSet: { users: userId } },
      { new: true }
    )

    return await this.userModel.findById(userId)
  }
}
