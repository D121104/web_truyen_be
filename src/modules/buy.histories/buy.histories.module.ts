import { Module } from '@nestjs/common';
import { BuyHistoriesService } from './buy.histories.service';
import { BuyHistoriesController } from './buy.histories.controller';

@Module({
  controllers: [BuyHistoriesController],
  providers: [BuyHistoriesService],
})
export class BuyHistoriesModule {}
