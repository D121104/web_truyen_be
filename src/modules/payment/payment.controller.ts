import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common'
import { PaymentService } from './payment.service'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'
import { Public } from '@/decorator/customize'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('pay')
  create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
    return this.paymentService.create(createPaymentDto, req.user)
  }

  @Public()
  @Get('check/:id')
  async checkPayment(@Param('id') id: string, @Res() res: any) {
    const isSuccess = await this.paymentService.checkPayment(id)

    if (isSuccess) {
      return res.redirect('http://localhost:3000/?paymentSuccess=true')
    }
  }

  @Get()
  findAll() {
    return this.paymentService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id)
  }
}
