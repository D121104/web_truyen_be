import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { IUser } from '../users/users.interface';
import redisClient from '@/config/redis';
import { UsersService } from '../users/users.service';


@Injectable()
export class PaymentService {

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService
  ) { }

  getRandom9DigitInt(): number {
    return Math.floor(100000000 + Math.random() * 900000000);
  }

  async checkPayment(id: number) {
    if (!redisClient.exists(id.toString())) {
      throw new BadRequestException('Order code not found');
    }

    const url = this.configService.get<string>('PAYOS_URL');
    const dataRaw = await redisClient.get(id.toString());
    const dataStr = typeof dataRaw === 'string' ? dataRaw : dataRaw?.toString();
    const dataPayment = JSON.parse(dataStr);
    const res = await fetch(`${url}/v2/payment-requests/${id}`, {
      headers: {
        'x-api-key': process.env.API_KEY_PAYOS,
        'x-client-id': process.env.CLIENT_ID,
      },
      method: 'GET',
    });

    if (res.ok) {
      const resp = await res.json();
      const { status } = resp.data;

      if (status === "PAID") {
        const userId = dataPayment.userId;
        const amount = resp.data.amount;

        await this.userService.addCoin(userId, amount);
        await redisClient.del(id.toString());
      }
      else {
        throw new BadRequestException('Payment not completed');
      }
      return true;
    }

  }

  async create(createPaymentDto: CreatePaymentDto, user: IUser) {
    const { amount } = createPaymentDto;
    const orderCode = this.getRandom9DigitInt();
    const description = 'Payment for order code: ' + orderCode;
    const cancelUrl = 'http://localhost:3000/';
    const returnUrl = `http://localhost:8080/api/check/${orderCode}`;

    const url = this.configService.get<string>('PAYOS_URL');

    // Sắp xếp và tạo chuỗi data
    const data = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;

    // Lấy checksum key từ biến môi trường
    const checksumKey = process.env.CHECKSUM_KEY || '';

    // Tạo signature HMAC_SHA256
    const signature = crypto
      .createHmac('sha256', checksumKey)
      .update(data)
      .digest('hex');


    const body = JSON.stringify({
      userId: user._id,
      orderCode,
      amount,
      description,
      cancelUrl,
      returnUrl,
      signature,
    })

    const res = await fetch(`${url}/v2/payment-requests`, {
      headers: {
        'x-api-key': process.env.API_KEY_PAYOS,
        'x-client-id': process.env.CLIENT_ID,
      }

      , method: 'POST',

      body,

    })

    if (res.ok) {


      const resp = await res.json()
      redisClient.set(orderCode.toString(), JSON.stringify({
        userId: user._id,
        orderCode,
        amount,
      }), {
        EX: 60 * 60 * 24,
        NX: true,
      });
      return {
        url: resp.data.checkoutUrl
      }
    }

  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
