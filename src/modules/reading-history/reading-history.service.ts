import { Injectable } from '@nestjs/common'
import redisClient from '@/config/redis'
import { BooksService } from '@/modules/books/books.service'
import { ChaptersService } from '@/modules/chapters/chapters.service'

@Injectable()
export class ReadingHistoryService {
  constructor(
    private readonly booksService: BooksService,
    private readonly chaptersService: ChaptersService
  ) {}

  async saveReadingHistory(
    userId: string,
    bookId: string,
    chapterId: string,
    time: number = Date.now()
  ) {
    const key = `reading_history:${userId}`
    const book = await this.booksService.findOne(bookId, 'all')
    const chapter = await this.chaptersService.findOne(chapterId)
    if (!book || !chapter) {
      throw new Error('Book or chapter not found')
    }
    const chapterNumber = chapter.chapterNumber
    const bookTitle = book.bookTitle
    const bookImg = book.imgUrl
    const value = JSON.stringify({
      bookId,
      chapterId,
      time,
      chapterNumber,
      bookTitle,
      bookImg,
    })
    await redisClient.lPush(key, value)
    await redisClient.lTrim(key, 0, 99) // giữ 100 bản ghi gần nhất
    return { success: true }
  }

  async getReadingHistory(userId: string, limit = 20) {
    const key = `reading_history:${userId}`
    const items = await redisClient.lRange(key, 0, -1) // lấy toàn bộ lịch sử
    const parsed = items.map((item) => {
      const str = typeof item === 'string' ? item : item.toString()
      return JSON.parse(str)
    })

    // Duyệt từ đầu (mới nhất), chỉ lấy mỗi bookId 1 lần
    const uniqueBooks: Record<string, any> = {}
    for (const entry of parsed) {
      if (!uniqueBooks[entry.bookId]) {
        uniqueBooks[entry.bookId] = entry
      }
      if (Object.keys(uniqueBooks).length >= limit) break
    }

    // Trả về mảng các bản ghi, sắp xếp theo thời gian mới nhất
    return Object.values(uniqueBooks)
  }

  async deleteReadingHistoryByBook(userId: string, bookId: string) {
    const key = `reading_history:${userId}`
    const items = await redisClient.lRange(key, 0, -1)
    let removed = 0

    for (const item of items) {
      const str = typeof item === 'string' ? item : item.toString()
      const parsed = JSON.parse(str)
      if (parsed.bookId === bookId) {
        // Xóa tất cả các bản ghi có cùng bookId
        await redisClient.lRem(key, 0, item)
        removed++
      }
    }

    return {
      success: true,
      message:
        removed > 0
          ? 'Đã xóa lịch sử đọc truyện.'
          : 'Không tìm thấy lịch sử để xóa.',
      removed,
    }
  }
}
