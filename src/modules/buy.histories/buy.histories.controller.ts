import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BuyHistoriesService } from './buy.histories.service';
import { CreateBuyHistoryDto } from './dto/create-buy.history.dto';
import { UpdateBuyHistoryDto } from './dto/update-buy.history.dto';

@Controller('buy.histories')
export class BuyHistoriesController {
  constructor(private readonly buyHistoriesService: BuyHistoriesService) {}

  @Post()
  create(@Body() createBuyHistoryDto: CreateBuyHistoryDto) {
    return this.buyHistoriesService.create(createBuyHistoryDto);
  }

  @Get()
  findAll() {
    return this.buyHistoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buyHistoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBuyHistoryDto: UpdateBuyHistoryDto) {
    return this.buyHistoriesService.update(+id, updateBuyHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buyHistoriesService.remove(+id);
  }
}
