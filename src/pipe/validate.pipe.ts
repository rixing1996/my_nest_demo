import { PipeTransform, Injectable, ArgumentMetadata, HttpException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors: any = await validate(object);
    if (errors.length > 0) {
      const errorMsgObj: any = errors[0].constraints;
      let errorMsg: string;
      for (const key in errorMsgObj) {
        errorMsg = errorMsgObj[key] || 'Validation failed';
        break;
      }
      throw new HttpException(errorMsg, 400);
    }
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private toValidate(metatype: Function): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
