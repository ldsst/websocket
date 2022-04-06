import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('NATS_CONNECTION')
    private readonly client: ClientProxy,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToWs().getData();
    if (!req.token) return false;
    const { token, ua, ip } = req;
    const data = {
      token,
      ip,
      ua,
    };
    const pattern = { cmd: 'validate_token' };
    const response = await this.client
      .send(pattern, data)
      .toPromise()
      // tslint:disable-next-line:no-console
      .catch(err => console.log(err));

    req.userId = response.userId;
    req.userAgent = ua;
    req.userIp = ip;
    return response.status;
  }
}
