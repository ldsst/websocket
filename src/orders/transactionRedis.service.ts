import { Injectable, Inject, Logger } from '@nestjs/common';
import { RedisClient } from 'redis';

@Injectable()
export class TransactionRedisService {
  constructor(
    @Inject('RedisConnection') private readonly redisClient: RedisClient,
  ) {}

  private TTL: string = process.env.TTL_REDIS || '5000';

  checkIfExists(userId) {
    return new Promise((resolve, reject) => {
      this.redisClient.exists(`${userId}_transaction`, (err, res) => {
        if (err) reject(err.message);
        Logger.log(
          `response of redis exists: ${res}`,
          'TransactionRedisService.checkIfExists',
        );
        if (res === 1) {
          resolve(false);
        } else {
          this.redisClient.set(
            `${userId}_transaction`,
            'hold',
            'PX',
            parseInt(this.TTL, 10),
            err => {
              Logger.log(
                `creating transaction key: ${userId}_transaction`,
                'TransactionRedisService.checkIfExists',
              );
              if (err) reject(err.message);
              resolve(true);
            },
          );
        }
      });
    });
  }

  delete(userId) {
    return new Promise((resolve, reject) => {
      this.redisClient.del(`${userId}_transaction`, err => {
        Logger.log(
          `removing transaction key: ${userId}_transaction`,
          'TransactionRedisService.checkIfExists',
        );
        if (err) reject(err.message);
        resolve(true);
      });
    });
  }
}