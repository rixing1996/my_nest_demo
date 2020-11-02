import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtMyService {
  constructor(private jwtService: JwtService) {
  }

  // 生成token
  createToken(data) {
    let token = this.jwtService.sign(data);
    return token;
  }
}
