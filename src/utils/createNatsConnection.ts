import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';

const natsHost = process.env.NATS_HOST || 'localhost';
const natsPort = process.env.NATS_PORT || 4222;

const options: any = {
  transport: Transport.NATS,
  options: {
    url: `nats://${natsHost}:${natsPort}`,
    user: process.env.NATS_USER,
    pass: process.env.NATS_PASS,
  },
};

export const createNatsConnection = (): ClientProxy => {
  return ClientProxyFactory.create(options);
};
