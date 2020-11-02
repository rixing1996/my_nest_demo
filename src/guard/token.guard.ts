import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    let isLoginOther: boolean = this.userService.isLoginInOther({
      id: request.user.id,
      login_time: request.user.login_time,
    });
    if (!isLoginOther) {
      return true;
    } else {
      throw new HttpException('账号异常，请重新登录', 401);
    }
  }
}
