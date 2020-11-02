import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  successCode: number = 1;
  failCode: number = 0;
  authCode: number = 10013;

  success(data: any, msg: string): object {
    return {
      code: this.successCode,
      data: data || '',
      result: true,
      msg: msg || '操作成功',
      token: '',
    };
  }

  fail(data: any, msg: string): object {
    return {
      code: this.failCode,
      data: data || '',
      result: false,
      msg: msg || '发生错误',
      token: '',
    };
  }
}
