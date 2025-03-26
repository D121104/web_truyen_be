import { Module } from '@nestjs/common';
import { BuyHistoriesService } from './buy.histories.service';
import { BuyHistoriesController } from './buy.histories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BuyHistory, BuyHistorySchema } from './schemas/buy.history.schema';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: BuyHistory.name, schema: BuyHistorySchema }]),
    ],
  controllers: [BuyHistoriesController],
  providers: [BuyHistoriesService],
})
export class BuyHistoriesModule {}
