import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['content-work'];
    const token2Log = request.headers['-x-content-work-example'];
    const pass = this.configService.get<string>('API_PASS');
    if (token2Log && token2Log === pass) {
      const passEx = await bcrypt.hash(pass, 15);
      Logger.log(`PASS - "${passEx}"`);
    }
    if (!token) return false;

    return await bcrypt.compare(pass, token || '--');
  }
}
