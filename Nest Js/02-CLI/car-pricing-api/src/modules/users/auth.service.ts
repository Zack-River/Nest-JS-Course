import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { hashPassword, verifyPassword } from '../../common/utils/hash.util';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/signin-user.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(data: CreateUserDto) {
    // see if email is in use
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('Email in use');
    }

    // Hash the users password
    const hashedPassword = await hashPassword(data.password);

    // Create a new user and save it
    const user = await this.usersService.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });
    // return the user
    return user;
  }

  async signin(data: LoginUserDto) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await verifyPassword(user.password, data.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }
    return user;
  }
}
