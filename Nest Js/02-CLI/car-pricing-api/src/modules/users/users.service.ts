import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}
  async create(userData: CreateUserDto) {
    const existedUser = await this.repo.findOneBy({ email: userData.email });
    if (existedUser) {
      return null;
    }
    const user = this.repo.create(userData);
    await this.repo.save(user);

    return { ...user };
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    user.updatedAt = new Date();
    await this.repo.save(user);
    return user;
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    if (attrs.email) {
      const existedUser = await this.repo.findOneBy({ email: attrs.email });
      if (existedUser) {
        throw new Error('Email already exists');
      }
    }
    Object.assign(user, attrs);
    await this.repo.save(user);
    return user;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    return await this.repo.remove(user);
  }

  async comparePassword(plainTextPassword: string, hashedPassword: string) {
    return plainTextPassword === hashedPassword;
  }
}
