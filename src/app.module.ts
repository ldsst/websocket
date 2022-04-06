import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersModule } from './orders/orders.module';
import { HealthModule } from './health.module';
import { NatsModule } from './nats.module';

const pgHost = process.env.PG_HOST;
const pgPort: number = parseInt(process.env.PG_PORT, 10) || 5432;
const pgUser = process.env.PG_USER;
const pgPass = process.env.PG_PASSWORD;
const pgDatebase = process.env.PG_DATABASE;

@Module({
  imports: [
    NatsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: pgHost,
      port: pgPort,
      username: pgUser,
      password: pgPass,
      database: pgDatebase,
      schema: 'arbwallet',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: process.env.LOGGING === 'true' ? true : false,
    }),
    OrdersModule,
    HealthModule,
  ],
})
export class AppModule {}
