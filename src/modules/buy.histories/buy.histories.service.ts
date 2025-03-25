import { Injectable } from '@nestjs/common';
import { CreateBuyHistoryDto } from './dto/create-buy.history.dto';
import { UpdateBuyHistoryDto } from './dto/update-buy.history.dto';

@Injectable()
export class BuyHistoriesService {
  create(createBuyHistoryDto: CreateBuyHistoryDto) {
    return 'This action adds a new buyHistory';
  }

  findAll() {
    return `This action returns all buyHistories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} buyHistory`;
  }

  update(id: number, updateBuyHistoryDto: UpdateBuyHistoryDto) {
    return `This action updates a #${id} buyHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} buyHistory`;
  }
}
