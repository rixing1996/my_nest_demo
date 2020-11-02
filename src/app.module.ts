import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { UtilsModule } from './utils/utils.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from './pipe/validate.pipe';
import { ResultInterceptor } from './interceptor/result.interceptor';
import { MyGlobalFilter } from './filter/myGlobal.filter';
import { MyJwtModule } from './jwt/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuModule } from './modules/menu/menu.module';
import { RoleModule } from './modules/role/role.module';
import { ButtonModule } from './modules/button/button.module';
import { AuthorityModule } from './modules/authority/authority.module';

@Module({
  imports: [TypeOrmModule.forRoot(), UserModule, UtilsModule, MyJwtModule, MenuModule, RoleModule, ButtonModule, AuthorityModule],
  controllers: [],
  providers: [{
    provide: APP_PIPE,
    useClass: ValidationPipe,//全局验证管道
  }, {
    provide: APP_INTERCEPTOR,
    useClass: ResultInterceptor,//全局拦截器，处理返回数据
  }, {
    provide: APP_FILTER,
    useClass: MyGlobalFilter,//全局过滤器，处理全局错误
  }],
})
export class AppModule {
}
