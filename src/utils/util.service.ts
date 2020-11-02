import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
  // 时间格式化方法
  dateFormat(time: any = new Date(), format: any = 'yyyy-MM-dd hh:mm:ss'): string {
    let date: Date;
    let valueStr: string;
    try {
      if (typeof time === 'object') {
        date = time;
      } else if (typeof time === 'string') {
        time = time.replace(/(-|年|月|日)/g, '/');
        date = new Date(time);
      } else {
        if (typeof time === 'number') {
          if ((time + '').length === 10) {
            time = time * 1000;
          }
          date = new Date(parseInt(time));
        } else {
          date = new Date(time);
        }
      }
      const formatObj: any = {
        y: date.getFullYear(),
        M: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds(),
        w: date.getDay(),
      };
      valueStr = format.replace(/(y|M|d|h|m|s|w)+/g, (val, key) => {
        let value = formatObj[key];
        (key === 'y' && val.length === 2) && (value = (value + '').slice(2));
        (key === 'M' && val.length === 2) && value < 10 && (value = '0' + value);
        (key === 'd' && val.length === 2) && value < 10 && (value = '0' + value);
        (key === 'h' && val.length === 2) && value < 10 && (value = '0' + value);
        (key === 'm' && val.length === 2) && value < 10 && (value = '0' + value);
        (key === 's' && val.length === 2) && value < 10 && (value = '0' + value);
        key === 'w' && (value = ['日', '一', '二', '三', '四', '五', '六'][value]);
        return value;
      });
    } catch (e) {
      throw new HttpException('服务器转换时间出错', 500);
    }
    return valueStr;
  }

  // 将字符串类型转换成数字类型
  anyToNumber(oldValue: any, attribute: string, transform: boolean): number {
    let newValue: number;
    let errorMsg: string = transform ? (attribute + '类型有误') : (attribute + '转换失败');
    let status: number = transform ? 400 : 500;
    if (!['number', 'string'].includes(typeof oldValue)) {
      throw new HttpException(errorMsg, status);
    }
    if (isNaN(Number(oldValue))) {
      throw new HttpException(errorMsg, status);
    } else {
      newValue = Number(oldValue);
    }
    return newValue;
  }

  // 将json数据转成js数据类型
  jsonToObject(oldValue: any, attribute: string, transform: boolean): any {
    let newValue: any;
    let errorMsg: string = transform ? (attribute + '类型有误') : (attribute + '转换失败');
    let status: number = transform ? 400 : 500;
    try {
      newValue = JSON.parse(oldValue);
    } catch (e) {
      throw new HttpException(errorMsg, status);
    }
    return newValue;
  }

  // 将数据转换成数字字符串类型
  anyToNumberString(oldValue: any, attribute: string, transform: boolean): string {
    let newValue: string;
    let errorMsg: string = transform ? (attribute + '类型有误') : (attribute + '转换失败');
    let status: number = transform ? 400 : 500;
    if (!['number', 'string'].includes(typeof oldValue)) {
      throw new HttpException(errorMsg, status);
    }
    if (isNaN(Number(oldValue))) {
      throw new HttpException(errorMsg, status);
    } else {
      newValue = String(oldValue);
    }
    return newValue;
  }

  // 将数字字符串数组转换成数字数组
  stringArrToNumberArr(oldValue: any, attribute: string, transform: boolean): object {
    let newValue: object;
    let errorMsg: string = transform ? (attribute + '类型有误') : (attribute + '转换失败');
    let status: number = transform ? 400 : 500;
    if (typeof oldValue === 'object' && oldValue.length) {
      newValue = oldValue.map(item => {
        if (isNaN(Number(item))) {
          throw new HttpException(errorMsg, status);
        } else {
          return Number(item);
        }
      });
    } else {
      throw new HttpException(errorMsg, status);
    }
    return newValue;
  }
}
