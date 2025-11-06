import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.NODE_ENV === 'test' ? 'test.sqlite' : 'db.sqlite',
  entities: [path.join(__dirname, '**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
  synchronize: false,
});
