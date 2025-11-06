import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MiddlewareConsumer } from '@nestjs/common/interfaces';
const CookieSession = require('cookie-session');
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppDataSource } from '../data-source';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    UsersModule,
    ReportsModule,
    TypeOrmModule.forRoot(AppDataSource.options),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        CookieSession({
          name: 'session',
          keys: [this.configService.get<string>('COOKIE_KEY')],
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        }),
      )
      .forRoutes('*');
  }
}
