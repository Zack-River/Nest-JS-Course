import { Controller , BadRequestException } from '@nestjs/common';
import { Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
@Controller('/auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('/register')
    async createUser(@Body() user: CreateUserDto) {
        const { name , email, password } = user;
        const newUser = await this.usersService.create({ name, email, password });
        if (!newUser) {
            throw new BadRequestException('User could not be created email must be unique');
        }
        return {
            action: 'create User',
            success: true,
            message: `User ${name} with email ${email} has been created successfully`,
            meta: {
                affectedRows: 1
            },
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            }
        }
    }

    @Post('/login')
    async loginUser(@Body() user: { email: string; password: string }) {
        const { email, password } = user;
        const existingUser = await this.usersService.findOneBy({ email });
        if (!existingUser) {
            throw new Error('User with this email does not exist');
        }
        const isPasswordValid = await this.usersService.comparePassword(password, existingUser.password);
        if (!isPasswordValid) {
            throw new Error('Password is incorrect');
        }
        return {
            action: 'login User',
            success: true,
            message: `User ${existingUser.name} with email ${existingUser.email} has been logged in successfully`,
            meta: {
                affectedRows: 1
            },
            data: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
                createdAt: existingUser.createdAt,
                updatedAt: existingUser.updatedAt
            }
        }
    }
}
