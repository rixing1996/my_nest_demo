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
