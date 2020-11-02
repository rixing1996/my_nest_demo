#   nestjs项目的创建过程

### 第一步，创建一个nestjs项目
1.  下载nestjs项目脚本工具
    ```bash
    npm i -g @nestjs/cli
    ```
2.  使用cli工具创建nest项目
    ```bash
    nest new manage-service
    ```

### 第二步，创建一个user用户模块
1.  创建一个modules文件夹，用来存放模块的地方
2.  创建一个user文件夹，用来存放user模块的代码
3.  在user文件中创建对应的controller、service、module文件
    ```typescript
    //控制器层user.controller.ts的代码
    import { Controller, Get } from '@nestjs/common';
    import { UserService } from './user.service';
    
    @Controller('api/user')
    export class UserController {
      constructor(private userService: UserService) {
      }
    
      @Get('helloWorld')
      helloWorldTest(): string {
        return this.userService.helloWorldTest();
      }
    }
    
    
    //服务层user.service.ts的代码
    import { Injectable } from '@nestjs/common';
    
    @Injectable()
    export class UserService {
      helloWorldTest(): string {
        return 'hello world';
      }
    }

    
    //模块层user.module.ts的代码
    import { Module } from '@nestjs/common';
    import { UserService } from './user.service';
    import { UserController } from './user.controller';
    
    @Module({
      providers: [UserService],
      controllers: [UserController],
    })
    
    export class UserModule {
    }
    ```
4.  将user模块添加跟模块中
    ```typescript
    //根模块app.module.ts中的代码
    import { Module } from '@nestjs/common';
    import { UserModule } from './modules/user/user.module';
    
    @Module({
      imports: [UserModule],
      controllers: [],
      providers: [],
    })
    export class AppModule {
    }
    ```
### 创建一个时间格式化的全局service层方法
1.  创建一个utils的文件夹，用来存放全局utils工具方法的地方
2.  创建一个工具服务文件，util.service.ts的代码
    ```typescript
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
    }
    ```
3.  创建utils模块文件，将格式化服务层引入并且导出，utils.module.ts的代码
    ```typescript
    import { Global, Module } from '@nestjs/common';
    import { UtilService } from './util.service';
    
    @Global() //设置全局
    @Module({
      providers: [UtilService],
      controllers: [],
      exports: [UtilService],
    })
    
    export class UtilsModule {
    }
    ```
4.  将utils模块导入根模块中
    ```typescript
    import { Module } from '@nestjs/common';
    import { UserModule } from './modules/user/user.module';
    import { UtilsModule } from './utils/utils.module';   //全局工具模块
    
    @Module({
      imports: [UserModule, UtilsModule],
      controllers: [],
      providers: [],
    })
    export class AppModule {
    }
    ```
### 创建一个测试中间件
1.  创建一个middleware文件夹，用来存放中间件文件
2.  创建测试中间件文件，test.middleware.ts的代码
    ```typescript
    import { Injectable, NestMiddleware } from '@nestjs/common';
    import { Request, Response } from 'express';
    
    @Injectable()
    export class TestMiddleware implements NestMiddleware {
      use(req: Request, res: Response, next: () => void) {
        console.log('测试中间件');
        next();
      }
    }
    ```
3.  在使用到模块中使用，user.module.ts的代码
    ```typescript
    import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
    import { UserService } from './user.service';
    import { UserController } from './user.controller';
    import { TestMiddleware } from '../../middleware/test.middleware';
    
    @Module({
      providers: [UserService],
      controllers: [UserController],
    })
    
    export class UserModule implements NestModule {
      configure(consumer: MiddlewareConsumer): any {
        consumer.apply(TestMiddleware).forRoutes('api/user');
      }
    }
    ```
### 创建一个全局异常过滤器
1.  创建一个filter文件夹，用来存异常文件
2.  创建全局异常处理文件，myGlobal.filter.ts代码
    ```typescript
    import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
    
    @Catch()
    export class MyGlobalFilter implements ExceptionFilter {
      catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const status =
          exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json({
          statusCode: status,
          data: null,
          errorMsg: exception.response.error || exception.response,
          name: exception.response.message,
        });
      }
    }
    ```
3.  异常过滤器的使用，在main.ts中引入
    ```typescript
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { MyGlobalFilter } from './filter/myGlobal.filter';
    
    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      app.useGlobalFilters(new MyGlobalFilter());   //引入全局异常处理
      await app.listen(39010);
    }
    
    bootstrap();
    ```
### 管道的使用(转换与验证)
1.  下载需要的npm包
    ```bash
    npm install --save class-validator class-transformer
    ```
2.  创建验证类,validate.pipe.ts的代码
    ```typescript
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
    ```
3.  在根模块中使用验证类
    ```typescript
    import { Module } from '@nestjs/common';
    import { UserModule } from './modules/user/user.module';
    import { UtilsModule } from './utils/utils.module';
    import { APP_PIPE } from '@nestjs/core';
    import { ValidationPipe } from './pipe/validate.pipe';
    
    @Module({
      imports: [UserModule, UtilsModule],
      controllers: [],
      providers: [{
        provide: APP_PIPE,
        useClass: ValidationPipe
      }],
    })
    export class AppModule {
    }
    ```
4.  验证类的例子
    ```typescript
    //实体类
    import { IsInt, IsString } from 'class-validator';
    
    export class TestParams {
      @IsString({ message: '名称为字符串类型' })
      readonly name: string;
    
      @IsString({ message: '密码为字符串类型' })
      readonly password: string;
    
      @IsInt({ message: '年龄为数字类型' })
      readonly age: number;
    }
    
    
    //控制器中使用
    import { Body, Controller, Get, Post } from '@nestjs/common';
    import { UserService } from './user.service';
    import { TestParams } from './param/test.params';
    
    @Controller('api/user')
    export class UserController {
      constructor(private userService: UserService) {
      }
    
      @Post('helloWorld')
      helloWorldTest(@Body() params: TestParams): string {
        console.log(params);
        return this.userService.helloWorldTest();
      }
    }
    ```
    
### 守卫的使用，创建一个验证token的测试
1.  创建一个guard文件夹，用来存放守卫的文件
2.  创建一个token的验证守卫文件，token.guard.ts文件的代码
    ```typescript
    import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
    import { Observable } from 'rxjs';
    
    @Injectable()
    export class TokenGuard implements CanActivate {
      canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        let request = context.switchToHttp().getRequest();
        if (request.headers.token) {
          return true;
        } else {
          throw new HttpException('token不能为空', 401);
        }
      }
    }
    ```
3.  在对应的地方使用守卫
    ```typescript
    import { Controller, Post, UseGuards } from '@nestjs/common';
    import { UserService } from './user.service';
    import { TokenGuard } from '../../guard/token.guard';
    
    @Controller('api/user')
    export class UserController {
      constructor(private userService: UserService) {
      }
    
      @Post('helloWorld')
      @UseGuards(TokenGuard)
      helloWorldTest(): string {
        return this.userService.helloWorldTest();
      }
    }
    ```
    
### 拦截器的使用，创建一个格式化结果拦截器
1.  创建一个interceptor文件夹，用来保存拦截器文件
2.  创建一个结果集处理拦截器，result.interceptor.ts的代码
    ```typescript
    import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
    import { Observable } from 'rxjs';
    import { map } from 'rxjs/operators';
    
    @Injectable()
    export class ResultInterceptor implements NestInterceptor {
      intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(map(value => {
          return {
            errorMsg: '',
            name: '',
            data: value,
            statusCode: context.switchToHttp().getResponse().statusCode,
          };
        }));
      }
    }
    ```
3.  全局引用结果集拦截器
    ```typescript
    import { Module } from '@nestjs/common';
    import { UserModule } from './modules/user/user.module';
    import { UtilsModule } from './utils/utils.module';
    import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
    import { ValidationPipe } from './pipe/validate.pipe';
    import { ResultInterceptor } from './interceptor/result.interceptor';
    import { MyGlobalFilter } from './filter/myGlobal.filter';
    
    @Module({
      imports: [UserModule, UtilsModule],
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
    ```
### 自定义装饰器，创建一个获取token中id的装饰器
1.  创建一个decorator文件夹，用来存放装饰器文件
2.  创建一个tokenId.decorator.ts文件，代码为
    ```typescript
    import { createParamDecorator } from '@nestjs/common';
    
    export const TokenId = createParamDecorator((data: string, req) => {
      console.log(req.args[0].headers.token);
      return 1;
    });
    ```
3.  自定义装饰器的使用
    ```typescript
    import { Controller, Post } from '@nestjs/common';
    import { UserService } from './user.service';
    import { TokenId } from '../../decorator/tokenId.decorator';
    
    @Controller('api/user')
    export class UserController {
      constructor(private userService: UserService) {
      }
    
      @Post('helloWorld')
      helloWorldTest(@TokenId() id: string): string {
        console.log(id);
        return this.userService.helloWorldTest();
      }
    }
    ```
### 设置静态服务器
1.  在根目录创建public文件夹
2.  设置静态服务器的代码
    ```typescript
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { NestExpressApplication } from '@nestjs/platform-express';
    import { join } from 'path';
    
    async function bootstrap() {
      const app = await NestFactory.create<NestExpressApplication>(AppModule);
      // 设置静态服务器
      app.useStaticAssets(join(__dirname, '../public/'), {
        prefix: '/static/',
      });
      await app.listen(39010);
    }
    
    bootstrap();
    ```
### 创建jwt身份验证模块
1.  下载对应的包
    ```bash
    npm install --save @nestjs/passport passport passport-local
    npm install --save-dev @types/passport-local
    npm install @nestjs/jwt passport-jwt
    npm install @types/passport-jwt --save-dev
    ```
2.  创建jwt文件夹，用来存放身份验证的信息
3.  创建配置文件，配置jwt的密钥与验证过期时间
    ```typescript
    export const JwtConfig = {
      secret: 'ai520529874',
      expiresIn: '168h',
    };
    ```
4.  创建验证策略
    ```typescript
    import { PassportStrategy } from '@nestjs/passport';
    import { ExtractJwt, Strategy } from 'passport-jwt';
    import { Injectable } from '@nestjs/common';
    import { JwtConfig } from './jwt.config';
    
    @Injectable()
    export class JwtStrategy extends PassportStrategy(Strategy) {
      constructor() {
        super({
          jwtFromRequest: ExtractJwt.fromHeader('token'),
          ignoreExpiration: false,
          secretOrKey: JwtConfig.secret,
        });
      }
    
      async validate(user) {
        return user;
      }
    }
    ```
5.  创建生成token的文件
    ```typescript
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
    ```
6.  导出jwt模块
    ```typescript
    import { Global, Module } from '@nestjs/common';
    import { JwtModule } from '@nestjs/jwt';
    import { JwtConfig } from './jwt.config';
    import { JwtStrategy } from './jwt.strategy';
    import { JwtMyService } from './jwt.myService';
    import { PassportModule } from '@nestjs/passport';
    
    @Global()
    @Module({
      imports: [JwtModule.register({
        secret: JwtConfig.secret,
        signOptions: {
          expiresIn: JwtConfig.expiresIn,
        },
      }), PassportModule],
      providers: [JwtStrategy, JwtMyService],
      exports: [JwtMyService],
    })
    
    export class MyJwtModule {
    
    }
    ```
7.  将jwt模块引入根模块
8.  使用jwt验证
    ```typescript
    import { Controller, Post, Request, UseGuards } from '@nestjs/common';
    import { UserService } from './user.service';
    import { AuthGuard } from '@nestjs/passport';
    import { TokenId } from '../../decorator/tokenId.decorator';
    
    @Controller('api/user')
    export class UserController {
      constructor(private userService: UserService) {
      }
    
      @Post('helloWorld')
      @UseGuards(AuthGuard('jwt'))
      helloWorldTest(@TokenId("id") id: number): string {
        console.log(id);
        return this.userService.helloWorldTest();
      }
    }
    ```
### typeorm的使用
1.  下载typeorm需要用到的包
    ```bash
    npm install --save @nestjs/typeorm typeorm mysql
    ```
2.  在根目录下创建一个ormconfig.json文件，在package.json附近，用来配置typeorm
    ```json
    {
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "username": "xing",
      "password": "ai520529874",
      "database": "wuye",
      "entities": [
        "dist/**/*.entity{.ts,.js}"
      ],
      "synchronize": true
    }
    ```
3.  在根模块下引入typeorm模块
    ```typescript
    import { Module } from '@nestjs/common';
    import { UserModule } from './modules/user/user.module';
    import { UtilsModule } from './utils/utils.module';
    import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
    import { ValidationPipe } from './pipe/validate.pipe';
    import { ResultInterceptor } from './interceptor/result.interceptor';
    import { MyGlobalFilter } from './filter/myGlobal.filter';
    import { MyJwtModule } from './jwt/jwt.module';
    import { TypeOrmModule } from '@nestjs/typeorm';
    import { InitModule } from './modules/init/init.module';
    
    @Module({
      imports: [TypeOrmModule.forRoot(), UserModule, UtilsModule, MyJwtModule, InitModule],
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
    ```
4.  创建实体
    ```typescript
    import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
    
    @Entity('user')
    export class UserEntity {
      @PrimaryGeneratedColumn({
        type: 'int',
        comment: '主键id',
      })
      id: number;
    
      @Column({
        type: 'varchar',
        nullable: false,
        comment: '用户名',
        length: 50,
      })
      user_name: string;
    
      @Column({
        type: 'varchar',
        length: 100,
        nullable: false,
        comment: '密码',
      })
      password: string;
    
      @Column({
        type: 'varchar',
        nullable: false,
        comment: '手机号，登陆账号',
        unique: true,
      })
      phone: string;
    
      @Column({
        type: 'varchar',
        comment: '用户头像',
        nullable: true,
      })
      head_pic: string;
    
      @Column({
        type: 'tinyint',
        nullable: false,
        default: () => 0,
        comment: '是否删除，0为正常，1为删除',
      })
      deleted: number;
    
      @CreateDateColumn({
        type: 'timestamp',
        nullable: false,
        comment: '创建时间',
      })
      create_time: Date;
    
      @UpdateDateColumn({
        type: 'timestamp',
        nullable: false,
        comment: '修改时间',
      })
      update_time: Date;
    }
    ```
5.  在用到的模块中引入实体
    ```typescript
    import { Module } from '@nestjs/common';
    import { InitService } from './init.service';
    import { InitController } from './init.controller';
    import { TypeOrmModule } from '@nestjs/typeorm';
    import { UserEntity } from '../../entities/user.entity';
    
    @Module({
      imports: [TypeOrmModule.forFeature([UserEntity])],
      providers: [InitService],
      controllers: [InitController],
    })
    
    export class InitModule {
    
    }
    ```
6.  在对应的地方依赖注入使用
    ```typescript
    import { Injectable } from '@nestjs/common';
    import { InjectRepository } from '@nestjs/typeorm';
    import { UserEntity } from '../../entities/user.entity';
    import { Repository } from 'typeorm';
    
    @Injectable()
    export class InitService {
      constructor(
        @InjectRepository(UserEntity) private readonly userEntity: Repository<UserEntity>,
      ) {
      }
    
      async init(): Promise<string> {
        let user: UserEntity = await this.userEntity.findOne({ phone: '18814233102' });
        console.log(user);
        return '初始化';
      }
    }
    ```
### typeorm使用的问题
1.  使用save保存时，保存成功时返回保存的对象
2.  查询单个数据时，查询不到则返回undefined
3.  查询多个数据时，查询不到返回空数组
4.  使用findAndCount查询时，返回一个数组，第一个参数为查询的对象，第二个为查询到的数量

### 集成swagger
1.  下载对应的包
    ```bash
    yarn add @nestjs/swagger swagger-ui-express --save
    ```
2.  在main文件中配置swagger
    ```typescript
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { NestExpressApplication } from '@nestjs/platform-express';
    import { join } from 'path';
    import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
    
    async function bootstrap() {
      const app = await NestFactory.create<NestExpressApplication>(AppModule);
      // 处理跨域
      app.enableCors();
      // 设置静态服务器
      app.useStaticAssets(join(__dirname, '../public/'), {
        prefix: '/static/',
      });
      // 配置swagger
      const options = new DocumentBuilder().setTitle('物业api接口').setDescription('物业api接口的详细介绍').setVersion('1.0.0').build();
      const document = SwaggerModule.createDocument(app, options);
      SwaggerModule.setup('/api/help', app, document);
      await app.listen(39010);
    }
    
    bootstrap();
    ```
