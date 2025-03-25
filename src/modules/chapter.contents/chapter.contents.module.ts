import { Module } from '@nestjs/common';
import { ChapterContentsService } from './chapter.contents.service';
import { ChapterContentsController } from './chapter.contents.controller';

@Module({
  controllers: [ChapterContentsController],
  providers: [ChapterContentsService],
})
export class ChapterContentsModule {}
