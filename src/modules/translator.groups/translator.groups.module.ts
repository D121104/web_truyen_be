import { Module } from '@nestjs/common';
import { TranslatorGroupsService } from './translator.groups.service';
import { TranslatorGroupsController } from './translator.groups.controller';

@Module({
  controllers: [TranslatorGroupsController],
  providers: [TranslatorGroupsService],
})
export class TranslatorGroupsModule {}
