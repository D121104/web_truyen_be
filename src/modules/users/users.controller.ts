import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ChangePasswordUserDto } from './dto/change-password-user.dto'
import { Public } from '@/decorator/customize'
import { Response } from 'express'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string
  ) {
    return this.usersService.findAll(query, +current, +pageSize)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id)
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }

  @Public()
  @Get('/password/forgot-password')
  async forgotPassword(@Query('token') token: string, @Res() res: Response) {
    const result = await this.usersService.forgotPassword(token)
    if (result) {
      const redirectUrl = `http://localhost:3000/login`
      return res.render('forgot-password', { redirectUrl })
    }
  }

  @Post('change-password')
  changePassword(@Body() body: ChangePasswordUserDto, @Req() req) {
    return this.usersService.changePassword(req.user, body)
  }
}
