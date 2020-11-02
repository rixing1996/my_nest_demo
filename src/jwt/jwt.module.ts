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
