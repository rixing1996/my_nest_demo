import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class ValidateService {
  // 验证是否为空
  isRequired(value: any, options: any = { message: '参数不能为空' }): void {
    if (!value && typeof value !== 'number') {
      throw new HttpException(options.message, 400);
    }
  }

  // 判断是否是字符串
  isString(value: any, options: any = { message: '参数必须为字符串类型' }): void {
    if (value) {
      if (typeof value !== 'string') {
        throw new HttpException(options.message, 400);
      }
    }
  }

  // 判断是否是数字类型
  isNumber(value: any, options: any = { message: '参数必须为数字类型' }): void {
    if (value) {
      if (typeof value !== 'number') {
        throw new HttpException(options.message, 400);
      }
    }
  }

  // 判断是否是电话号码
  isTelPhone(value: any, options: any = { message: '参数必须为电话号码' }): void {
    if (value) {
      if (!/^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/.test(value)) {
        throw new HttpException(options.message, 400);
      }
    }
  }

  // 判断是否是手机号码
  isMobilePhone(value: any, options: any = { message: '参数必须为手机号' }): void {
    if (value) {
      if (!/^(1[3584]\d{9})$/.test(value)) {
        throw new HttpException(options.message, 400);
      }
    }
  }

  // 判断是否是邮箱
  isEmail(value: any, options: any = { message: '参数必须为邮箱类型' }): void {
    if (value) {
      if (!/^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/.test(value)) {
        throw new HttpException(options.message, 400);
      }
    }
  }

  // 判断是否是路由地址
  isRouteUrl(value: any, options: any = { message: '参数必须为链接地址' }): void {
    if (value) {
      if (!/^(\/\w+)+$/.test(value)) {
        throw new HttpException(options.message, 400);
      }
    }
  }

  // 判断是否是数字数组
  isNumberArray(value: any, options: any = { message: '参数必须为数字数组' }): void {
    if (value) {
      if (typeof value === 'object' && (value.length || value.length === 0)) {
        value.forEach(item => {
          if (typeof item !== 'number') {
            throw new HttpException(options.message, 400);
          }
        });
      } else {
        throw new HttpException(options.message, 400);
      }
    }
  }
}
