import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private repo: Repository<User>,
    ) {}
    async create (userData: CreateUserDto) {
        const existedUser = await this.repo.findOneBy({ email: userData.email });
        if (existedUser) {
            return null;
        }
        const user = this.repo.create(userData);
        await this.repo.save(user);

        return { ...user };
    }

    async findOneBy (criteria: Partial<User>) {
        const user = await this.repo.findOneBy(criteria);
        if (!user) {
            return null;
        }
        user.updatedAt = new Date();
        await this.repo.save(user);
        return { ...user };
    }

    async comparePassword (plainTextPassword: string, hashedPassword: string) {
        return plainTextPassword === hashedPassword;
    }
}
