import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
const CookieSession = require('cookie-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    CookieSession({
      name: 'session',
      keys: ['asdf1234543!@#asfdasf'],
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
