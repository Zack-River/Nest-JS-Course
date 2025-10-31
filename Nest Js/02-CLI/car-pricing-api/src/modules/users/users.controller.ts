import {
  Controller,
  BadRequestException,
  Delete,
  Get,
  Patch,
} from '@nestjs/common';
import { Post, Body, Param, Query } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from '../../common/decorators/serialize.decorator';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/signin-user.dto';

@Controller('/users')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('/register')
  async createUser(@Body() user: CreateUserDto) {
    const newUser = await this.authService.signup(user);
    if (!newUser) {
      throw new BadRequestException('User could not be created');
    }
    return {
      action: 'create User',
      success: true,
      message: `User ${newUser.name} with email ${newUser.email} has been created successfully`,
      meta: {
        affectedRows: 1,
      },
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    };
  }

  @Post('/login')
  async loginUser(@Body() user: LoginUserDto) {
    const existingUser = await this.authService.signin(user);
    if (!existingUser) {
      throw new BadRequestException('User could not be logged in');
    }
    return {
      action: 'login User',
      success: true,
      message: `User ${existingUser.name} with email ${existingUser.email} has been logged in successfully`,
      meta: {
        affectedRows: 1,
      },
      data: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      },
    };
  }

  @Patch('/:id')
  async updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    const updatedUser = await this.usersService.update(parseInt(id), user);
    if (!updatedUser) {
      throw new BadRequestException('User could not be updated');
    }
    return {
      action: 'update User',
      success: true,
      message: `User with id ${id} has been updated successfully`,
      meta: {
        affectedRows: 1,
      },
      data: updatedUser,
    };
  }

  @Delete('/delete')
  async deleteUser(@Query('id') id: number) {
    const deletedUser = await this.usersService.remove(id);
    if (!deletedUser) {
      throw new BadRequestException('User could not be deleted');
    }
    return {
      action: 'delete User',
      success: true,
      message: `User with id ${id} has been deleted successfully`,
      meta: {
        affectedRows: 1,
      },
      data: deletedUser,
    };
  }

  @Get('/')
  async getUserByEmail(@Query('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return {
      action: 'get User',
      success: true,
      message: `User with email ${email} has been retrieved successfully`,
      meta: {
        affectedRows: 1,
      },
      data: user,
    };
  }

  @Get('/:id')
  async getUserById(@Param('id') id: number) {
    console.log('Handler Is Running');

    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return {
      action: 'get User',
      success: true,
      message: `User with id ${id} has been retrieved successfully`,
      meta: {
        affectedRows: 1,
      },
      data: user,
    };
  }
}
