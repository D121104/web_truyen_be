import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Comment, CommentDocument } from './schemas/comment.schema'
import mongoose, { Model } from 'mongoose'
import aqp from 'api-query-params'
import { IUser } from '../users/users.interface'

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>
  ) {}

  async create(createCommentDto: CreateCommentDto, user: IUser) {
    const { bookId, content, parentId } = createCommentDto

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('Invalid book id')
    }

    const comment = new this.commentModel({
      book: bookId,
      content,
      user: user._id.toString(),
      parentId,
    })

    let rightValue: number

    if (!parentId) {
      const maxRightValue = await this.commentModel.findOne(
        {
          book: new mongoose.Types.ObjectId(bookId),
        },
        'right',
        { sort: { right: -1 } }
      )

      if (maxRightValue) {
        rightValue = maxRightValue.right + 1
      } else {
        rightValue = 1
      }
    } else {
      const parentComment = await this.commentModel.findOne({
        _id: parentId,
      })
      if (!parentComment) {
        throw new BadRequestException('Parent comment not found')
      }
      rightValue = parentComment.right

      await this.commentModel.updateMany(
        {
          book: new mongoose.Types.ObjectId(bookId),
          right: { $gte: rightValue },
        },
        {
          $inc: { right: 2 },
        }
      )
      await this.commentModel.updateMany(
        {
          book: new mongoose.Types.ObjectId(bookId),
          left: { $gt: rightValue },
        },
        {
          $inc: { left: 2 },
        }
      )
    }

    comment.left = rightValue
    comment.right = rightValue + 1

    await comment.save()

    return comment.populate({
      path: 'user',
      select: {
        name: 1,
      },
    })
  }

  async findAll(qs: any) {
    try {
      const { filter, sort, population } = aqp(qs)
      delete filter.current
      delete filter.pageSize
      const totalRecord = (await this.commentModel.find(filter)).length
      const limit = qs.pageSize ? parseInt(qs.pageSize) : 10
      const totalPage = Math.ceil(totalRecord / limit)
      const skip = (qs.current - 1) * limit
      const current = +qs.current ? +qs.current : 1
      const comments = await this.commentModel
        .find(filter)
        .populate({
          path: 'user',
          select: {
            name: 1,
          },
        })
        .skip(skip)
        .limit(limit)
        .sort(sort as any)

      const response = {
        meta: {
          current: current,
          pageSize: limit,
          pages: totalPage,
          total: totalRecord,
        },
        result: comments,
      }

      return response
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }

  async findByParent(parentId: string, qs: any) {
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException('Invalid book id')
    }
    try {
      const { filter, sort, population } = aqp(qs)
      delete filter.current
      delete filter.pageSize
      filter.parentId = parentId
      const totalRecord = (await this.commentModel.find(filter)).length
      const limit = qs.pageSize ? parseInt(qs.pageSize) : 10
      const totalPage = Math.ceil(totalRecord / limit)
      const skip = (qs.current - 1) * limit
      const current = +qs.current ? +qs.current : 1
      const comments = await this.commentModel
        .find(filter)
        .populate({
          path: 'user',
          select: {
            name: 1,
          },
        })
        .skip(skip)
        .limit(limit)
        .sort(sort as any)

      const response = {
        meta: {
          current: current,
          pageSize: limit,
          pages: totalPage,
          total: totalRecord,
        },
        result: comments,
      }

      return response
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }

  async findByBook(bookId: string, qs: any) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('Invalid book id')
    }

    try {
      const { filter, sort, population } = aqp(qs)
      delete filter.current
      delete filter.pageSize
      filter.book = bookId
      filter.parentId = { $exists: false }
      const totalRecord = (await this.commentModel.find(filter)).length
      const limit = qs.pageSize ? parseInt(qs.pageSize) : 10
      const totalPage = Math.ceil(totalRecord / limit)
      const skip = (qs.current - 1) * limit
      const current = +qs.current ? +qs.current : 1
      const comments = await this.commentModel
        .find(filter)
        .populate({
          path: 'user',
          select: {
            name: 1,
          },
        })
        .skip(skip)
        .limit(limit)
        .sort(sort as any)

      const response = {
        meta: {
          current: current,
          pageSize: limit,
          pages: totalPage,
          total: totalRecord,
        },
        result: comments,
      }

      return response
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid comment id')
    }

    const comment = await this.commentModel.findOne({
      _id: id,
    })

    if (!comment) {
      throw new BadRequestException('Comment not found')
    }

    if (comment.user.toString() !== user._id.toString()) {
      throw new BadRequestException(
        'You are not allowed to delete this comment'
      )
    }

    const leftValue = comment.left
    const rightValue = comment.right
    const width = rightValue - leftValue + 1

    await this.commentModel.deleteMany({
      book: comment.book,
      left: { $gte: leftValue },
      right: { $lte: rightValue },
    })

    await this.commentModel.updateMany(
      {
        book: comment.book,
        left: { $gt: rightValue },
      },
      {
        $inc: { left: -width },
      }
    )

    await this.commentModel.updateMany(
      {
        book: comment.book,
        right: { $gt: rightValue },
      },
      {
        $inc: { right: -width },
      }
    )

    return comment
  }
}
