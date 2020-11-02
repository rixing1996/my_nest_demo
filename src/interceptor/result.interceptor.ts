import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtMyService } from '../jwt/jwt.myService';

@Injectable()
export class ResultInterceptor implements NestInterceptor {
  constructor(
    private readonly jwtMyService: JwtMyService,
  ) {
  }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    let request = context.switchToHttp().getRequest();

    return next.handle().pipe(map(value => {
      if (request.user && request.user.id) {
        value.token = this.jwtMyService.createToken({ id: request.user.id, login_time: request.user.login_time });
      }
      return {
        errorMsg: '',
        name: '',
        data: value,
        statusCode: context.switchToHttp().getResponse().statusCode,
      };
    }));
  }
}
