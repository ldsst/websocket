import { Injectable, Inject } from '@nestjs/common';
import { PlaceOrderDTO } from '../dto/placeOrder.dto';
import { WsException } from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from '../entity/order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as math from 'mathjs';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('NATS_CONNECTION')
    private readonly clientProxy: ClientProxy,
  ) {}

  async orderBookAll(pair: string) {
    const ordersBuy = await this.orderRepository.find({
      where: {
        done: 0,
        del: 0,
        locked: 0,
        pair,
        side: 'buy',
      },
      order: {
        price_unity: 'DESC',
      },
      relations: ['user'],
    });

    const orderBookBuy = ordersBuy.map(order => ({
      orderIdentificator: order.identificator,
      user_id: order.user.uid,
      pair: order.pair,
      side: order.side,
      amount: order.amount,
      total: math.multiply(order.price_unity, order.amount),
      price: order.price_unity,
    }));

    const ordersSell = await this.orderRepository.find({
      where: {
        done: 0,
        del: 0,
        locked: 0,
        pair,
        side: 'sell',
      },
      order: {
        price_unity: 'ASC',
      },
      relations: ['user'],
    });

    const orderBookSell = ordersSell.map(order => ({
      orderIdentificator: order.identificator,
      user_id: order.user.uid,
      pair: order.pair,
      side: order.side,
      amount: order.amount,
      total: math.multiply(order.price_unity, order.amount),
      price: order.price_unity,
    }));

    const orderBook = [...orderBookSell, ...orderBookBuy];

    const data = {
      [pair]: {
        orderBook,
      },
    };

    return data;
  }

  async placeOrder(data: PlaceOrderDTO) {
    const response = await this.clientProxy
      .send({ cmd: 'place_order' }, data)
      .toPromise()
      .catch(err => {
        throw new WsException(
          err.message ? err.message : 'Ocorreu um erro na operação',
        );
      });

    return response;
  }

  async ticker(pair) {
    return await this.clientProxy
      .send({ cmd: 'get_ticker' }, { pair })
      .toPromise()
      .catch(err => {
        throw new WsException(
          err.message ? err.message : 'Ocorreu um erro na operação',
        );
      });
  }

  async getTrades(pair) {
    return await this.clientProxy
      .send({ cmd: 'get_all_trades' }, { pair })
      .toPromise()
      .catch(err => {
        throw new WsException(
          err.message ? err.message : 'Ocorreu um erro na operação',
        );
      });
  }

  async orderExecution(data) {
    const response = await this.clientProxy
      .send({ cmd: 'order_execution' }, data)
      .toPromise()
      .catch(err => {
        throw new WsException(
          err.message ? err.message : 'Ocorreu um erro na execução de ordens',
        );
      });

    return {
      success: true,
      userIdCompatible: response.userIdCompatible,
      userIdIdentified: response.userIdIdentified,
      ordersExecuted: response.ordersExecuted,
      message: 'Ordem executada com sucesso',
    };
  }

  async orderDelete(data) {
    const response = await this.clientProxy
      .send({ cmd: 'order_delete' }, data)
      .toPromise()
      .catch(err => {
        throw new WsException(
          err.message ? err.message : 'Ocorreu um erro ao deletar a ordem',
        );
      });

    return {
      success: true,
      pair: response.pair,
      orderDeleted: response.orderDeleted,
      message: 'Ordem deletada com sucesso',
    };
  }
}
