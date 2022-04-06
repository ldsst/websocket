import { Module, CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { OrdersGateway } from './orders.gateway';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { createClient, RedisClient } from 'redis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entity/order.entity';
import { TransactionRedisService } from './transactionRedis.service';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort: any = process.env.REDIS_PORT || 6379;
const redisPass = process.env.REDIS_PASS;

@Module({
  providers: [
    OrdersService,
    OrdersGateway,
    TransactionRedisService,
    {
      provide: 'RedisConnection',
      useFactory: async () => {
        const client: RedisClient = createClient({
          host: redisHost,
          port: redisPort,
          password: redisPass,
        });
        return client;
      },
    },
  ],
  controllers: [OrdersController],
  imports: [
    TypeOrmModule.forFeature([Order]),
    CacheModule.register({
      store: redisStore,
      host: redisHost,
      port: redisPort,
      password: redisPass,
    }),
  ],
})
export class OrdersModule {}
