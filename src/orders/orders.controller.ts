import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OrdersGateway } from './orders.gateway';
import { PlaceOrderDTO } from '../dto/placeOrder.dto';
import { OrderDeleteDTO } from '../dto/orderDelete.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersGateway: OrdersGateway) {}

  @MessagePattern({ cmd: 'place_order_api' })
  async placeOrderApi(data: PlaceOrderDTO) {
    return await this.ordersGateway.placeOrderApi(data);
  }
  @MessagePattern({cmd: 'update_order_by_cron'})
  async updateOrderByCron (data){
    console.log(data);
    return await this.ordersGateway.updateOrderByCron(data);
  }
  @MessagePattern({ cmd: 'broadcast_all' })
  async broadcastAll(data: PlaceOrderDTO) {
    return await this.ordersGateway.brodcastAll(data);
  }

  @MessagePattern({ cmd: 'place_order_bot' })
  async placeOrderBot(data: PlaceOrderDTO) {
    data.userId = 2;
    data.our_order = 1;
    return await this.ordersGateway.placeOrderBot(data);
  }

  @MessagePattern({ cmd: 'order_delete_bot' })
  async orderDeleteBot(data: OrderDeleteDTO) {
    data.userId = 2;
    return await this.ordersGateway.orderDeleteBot(data);
  }
}
