import './tracer';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

const natsHost = process.env.NATS_HOST || 'nats';
const natsPort = process.env.NATS_PORT || 4222;

const options: any = {
  transport: Transport.NATS,
  options: {
    url: `nats://${natsHost}:${natsPort}`,
    user: process.env.NATS_USER,
    pass: process.env.NATS_PASS,
  },
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice(options);

  app.enableCors();
  
  await app.startAllMicroservicesAsync();
  await app.listen(4001);
}
bootstrap();
