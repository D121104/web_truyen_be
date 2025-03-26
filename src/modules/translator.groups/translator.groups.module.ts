import { Module } from '@nestjs/common';
import { TranslatorGroupsService } from './translator.groups.service';
import { TranslatorGroupsController } from './translator.groups.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TranslatorGroup, TranslatorGroupSchema } from './schemas/translator.group.schema';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: TranslatorGroup.name, schema: TranslatorGroupSchema }]),
    ],
  controllers: [TranslatorGroupsController],
  providers: [TranslatorGroupsService],
})
export class TranslatorGroupsModule {}
