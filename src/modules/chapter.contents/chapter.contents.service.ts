import { Injectable } from '@nestjs/common'
import { CreateChapterContentDto } from './dto/create-chapter.content.dto'
import { UpdateChapterContentDto } from './dto/update-chapter.content.dto'

@Injectable()
export class ChapterContentsService {
  create(createChapterContentDto: CreateChapterContentDto) {
    return 'This action adds a new chapterContent'
  }

  findAll() {
    return `This action returns all chapterContents`
  }

  findOne(id: number) {
    return `This action returns a #${id} chapterContent`
  }

  update(id: number, updateChapterContentDto: UpdateChapterContentDto) {
    return `This action updates a #${id} chapterContent`
  }

  remove(id: number) {
    return `This action removes a #${id} chapterContent`
  }
}
