import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import {
  CacheInterceptor,
  CacheKey,
  Inject,
  Logger,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PlaceOrderDTO } from '../dto/placeOrder.dto';
import { OrdersService } from './orders.service';
import { BookDTO } from '../dto/book.dto';
import { TradesDTO } from '../dto/trades.dto';
import { OrderDeleteDTO } from '../dto/orderDelete.dto';
import { AuthGuard } from '../guard/auth.guard';
import { RedisClient } from 'redis';
import { Order } from '../entity/order.entity';
import { TransactionRedisService } from './transactionRedis.service';

@WebSocketGateway()
export class OrdersGateway {
  constructor(
    private readonly orderService: OrdersService,
    @Inject('RedisConnection') private readonly redisClient: RedisClient,
    private readonly transactionRedisService: TransactionRedisService,
  ) {
  }

  @WebSocketServer() server;

  get(token: string) {
    return new Promise(async (resolve, reject) => {
      this.redisClient.get(token, (err, key) => {
        if (err) reject(err);
        resolve(key);
      });
    });
  }

  async brodcastAll(data) {
    await this.redisClient.set('lastPair', data.pair);
  }

  @SubscribeMessage('get-all-info')
  async getAllInfo(client) {
    const lastPair: any = await this.get('lastPair');

    const userIdIdentified: any = await this.get('userIdIdentified');
    const userIdCompatible: any = await this.get('userIdCompatible');

    if (lastPair) {
      this.getTradesAll(lastPair);
      this.sendOrderBook(lastPair);
      this.tickerAll(lastPair);

      await this.redisClient.set('lastPair', '');
    }

    if (userIdCompatible && userIdIdentified) {
      this.server.emit(`order_execution_${userIdIdentified}`, {
        success: true,
        message: 'Ordem executada com sucesso',
      });
      this.server.emit(`order_execution_${userIdCompatible}`, {
        success: true,
        message: 'Ordem executada com sucesso',
      });

      await this.redisClient.set('userIdCompatible', '');
      await this.redisClient.set('userIdIdentified', '');
    }
  }

  @UseGuards(AuthGuard)
  @SubscribeMessage('place_order')
  @UsePipes(new ValidationPipe())
  async placeOrder(client, data: PlaceOrderDTO) {

    const rate = await this.transactionRedisService.checkIfExists(data.userId);

    if (!rate) {
      return new WsException('Erro interno (#9566289)');
    }

    const response = await this.orderService.placeOrder(data).catch(err => err);

    if (response.success) {
      this.placeNewOrderBook(response.newOrder);
      try {
        this.orderExecution(
          response.newOrder.orderIdentificator,
          data.pair,
          data.userUid,
        );
      } catch (err) {
        return err;
      }
    }

    return response;
  }

  @UseGuards(AuthGuard)
  @CacheKey('order_book')
  @UseInterceptors(CacheInterceptor)
  @SubscribeMessage('order_book')
  @UsePipes(new ValidationPipe())
  async orderBook(client, data: BookDTO) {
    Logger.log('order book');
    const response = await this.orderService.orderBookAll(data.pair);
    return response;
  }

  @UseGuards(AuthGuard)
  @SubscribeMessage('trades')
  @UsePipes(new ValidationPipe())
  async getTrades(client, data: TradesDTO) {
    const response = await this.orderService.getTrades(data.pair);
    return response;
  }

  @UseGuards(AuthGuard)
  @SubscribeMessage('order_delete')
  @UsePipes(new ValidationPipe())
  async orderDelete(client, data: OrderDeleteDTO) {

    const rate = await this.transactionRedisService.checkIfExists(data.userId);

    if (!rate) {
      return new WsException('Erro interno (#9566289)');
    }

    try {
      const response = await this.orderService.orderDelete(data);

      if (response.success) {
        this.orderDeleteFromBook(response.orderDeleted);
      }

      return response;
    } catch (err) {
      Logger.log(`erro ao excluir ordem: ${err}`);
      return err;
    }
  }

  @UseGuards(AuthGuard)
  @SubscribeMessage('ticker')
  async ticker(client, { pair }) {
    try {
      const response = await this.orderService.ticker(pair);
      return response;
    } catch (err) {
      return err;
    }
  }

  async orderExecution(orderIdentificator, pair, userUid) {
    try {
      const response = await this.orderService.orderExecution({
        order_identificator: orderIdentificator,
      });

      Logger.log(`sucesso na execução ${response}`);

      this.updateOrderBook(response.ordersExecuted);

      this.server.emit(
        `order_execution_${response.userIdCompatible}`,
        response,
      );
      this.server.emit(
        `order_execution_${response.userIdIdentified}`,
        response,
      );
    } catch (err) {
      Logger.log(`erro na execução ${err}`);
      this.server.emit(`order_execution_${userUid}`, err);
    } finally {
      this.getTradesAll(pair);
      this.tickerAll(pair);
    }
  }

  async updateOrderByCron(data) {
    Logger.log(`update order by cron, buy to:${JSON.stringify(data)}`);
    try {
      this.server.emit('update_admin_order', data);
    } catch (e) {
      Logger.log('error messaging update order by cron')
    }
  }

  async tickerAll(pair) {
    const response = await this.orderService.ticker(pair);
    this.server.emit('ticker', response);
  }

  async updateOrderBook(ordersExecuted: Array<any>) {
    this.server.emit('update_order_book', { ordersExecuted });
  }

  async placeNewOrderBook(newOrder: Order) {
    this.server.emit('place_new_order', { newOrder });
  }

  async orderDeleteFromBook(orderDeleted: Order) {
    this.server.emit('order_delete_from_book', { orderDeleted });
  }

  @CacheKey('order_book')
  @UseInterceptors(CacheInterceptor)
  async sendOrderBook(pair: string) {
    const response = await this.orderService.orderBookAll(pair);

    this.server.emit('order_book', { response, pair });
  }

  async getTradesAll(pair) {
    const response = await this.orderService.getTrades(pair);
    this.server.emit('trades', response);
  }

  @UsePipes(new ValidationPipe())
  async placeOrderApi(data: PlaceOrderDTO) {
    const response = await this.orderService.placeOrder(data).catch(err => err);

    if (response.success) {
      await this.orderExecution(
        response.newOrder.orderIdentificator,
        data.pair,
        data.userUid,
      );
    }

    return response;
  }

  @UsePipes(new ValidationPipe())
  async placeOrderBot(data: PlaceOrderDTO) {
    const response = await this.orderService.placeOrder(data).catch(err => err);

    if (response.success) {
      await this.redisClient.set('lastPair', data.pair);
      await this.orderExecutionBot(response.newOrder.orderIdentificator);
    }

    return response;
  }

  @UsePipes(new ValidationPipe())
  async orderDeleteBot(data: OrderDeleteDTO) {
    const response = await this.orderService
      .orderDelete(data)
      // tslint:disable-next-line:no-console
      .catch(err => err);

    if (response.success) {
      await this.redisClient.set('lastPair', response.pair);
    }

    return response;
  }

  async orderExecutionBot(orderIdentificator) {
    try {
      const response = await this.orderService.orderExecution({
        order_identificator: orderIdentificator,
      });

      Logger.log(`successo na execucao ${response}`);

      await this.redisClient.set('userIdCompatible', response.userIdCompatible);
      await this.redisClient.set('userIdIdentified', response.userIdIdentified);
    } catch (err) {
      return err;
    }
  }
}
