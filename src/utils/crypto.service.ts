import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto-js';

@Injectable()
export class CryptoService {
  // 原生md5加密
  md5(data): string {
    return crypto.MD5(data).toString();
  }

  // 在原生的基础上添加自己的算法
  md5Encrypt(data: string): string {
    let center: string = this.md5(data);
    let leftNum: number = this.getRandomInt(6);
    let rightNum: number = this.getRandomInt(6);
    let leftStr: string = this.getRandomString(rightNum);
    let rightStr: string = this.getRandomString(leftNum);
    return leftNum + leftStr + center + rightStr + rightNum;
  }

  // 将自己基础封装的md5解密
  md5Decrypt(data: string): string {
    let leftNum: number = Number(data.slice(0, 1));
    let rightNum: number = Number(data.slice(data.length - 1));
    let afterCenter: string = data.slice(1, data.length - 1);
    let center = afterCenter.slice(rightNum);
    center = center.slice(0, center.length - leftNum);
    return center;
  }

  // 获取随机字符串
  private getRandomString(num: number): string {
    let stringArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    let str: string = '';
    for (let i = 0; i < num; i++) {
      let randomNum: number = this.getRandomInt(stringArr.length - 1);
      str += stringArr[randomNum];
    }
    return str;
  }

  // 获取0-xx的随机正整数
  private getRandomInt(xx: number): number {
    return Math.floor(Math.random() * (xx + 1));
  }

  // 加密解密的密码
  private secret: string = 'ai520529874';

  // 加密字符串
  encrypt(message: string): string {
    return crypto.AES.encrypt(message, this.secret).toString();
  }

  // 解密字符串
  decrypt(message: string): string {
    return crypto.AES.decrypt(message, this.secret).toString(crypto.enc.Utf8);
  }
}
