import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filter/all-exceptions.filter';
import { ResponseTransformInterceptor } from './common/interceptor/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();

  console.log('Connecting to Redis:', process.env.REDIS_URL);

  const config = new DocumentBuilder()
    .setTitle('Starforge API')
    .setDescription('Starforge API description')
    .setVersion('1.0')
    .addTag('starforge')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // 设置 Swagger 文档的访问路径为 /docs
  await app.listen(process.env.PORT || 4000, '0.0.0.0');
}
bootstrap();
