import {
  Controller,
  BadRequestException,
  Delete,
  Get,
  Patch,
  Session,
} from '@nestjs/common';
import { Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from '../../common/decorators/serialize.decorator';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/signin-user.dto';
import { SessionDto } from './dtos/session.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('/whoami')
  @UseGuards(AuthGuard)
  async whoAmI(@CurrentUser() user: User) {
    return {
      action: 'whoAmI',
      success: true,
      message: `User ${user.name} with email ${user.email} is logged in`,
      meta: {
        affectedRows: 1,
      },
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Serialize(UserDto)
  @Post('/register')
  async createUser(
    @Body() user: CreateUserDto,
    @Session() session: SessionDto,
  ) {
    const loggedInUserId = session.userId;
    if (loggedInUserId && loggedInUserId > 0) {
      const loggedInUser = await this.usersService.findOne(loggedInUserId);
      if (loggedInUser) {
        return {
          action: 'create User',
          success: true,
          message: `User ${loggedInUser.name} with email ${loggedInUser.email} is already logged in`,
          meta: {
            affectedRows: 1,
          },
          data: {
            id: loggedInUser.id,
            name: loggedInUser.name,
            email: loggedInUser.email,
            createdAt: loggedInUser.createdAt,
            updatedAt: loggedInUser.updatedAt,
          },
        };
      }
    }
    const newUser = await this.authService.signup(user);
    if (!newUser) {
      throw new BadRequestException('User could not be created');
    }
    session.userId = newUser.id;
    return {
      action: 'create User',
      success: true,
      message: `User ${newUser.name} with email ${newUser.email} has been created successfully`,
      meta: {
        affectedRows: 1,
        session: {
          userId: session.userId,
        },
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

  @Serialize(UserDto)
  @Post('/login')
  async loginUser(@Body() user: LoginUserDto, @Session() session: SessionDto) {
    const userId = session.userId;
    if (userId && userId > 0) {
      const LoggedInUser = await this.usersService.findOne(userId);
      if (LoggedInUser) {
        return {
          action: 'login User',
          success: true,
          message: `User ${LoggedInUser.name} with email ${LoggedInUser.email} is already logged in`,
          meta: {
            affectedRows: 1,
            session: {
              userId: session.userId,
            },
          },
          data: {
            id: LoggedInUser.id,
            name: LoggedInUser.name,
            email: LoggedInUser.email,
            createdAt: LoggedInUser.createdAt,
            updatedAt: LoggedInUser.updatedAt,
          },
        };
      }
    }
    const existingUser = await this.authService.signin(user);
    if (!existingUser) {
      throw new BadRequestException('User could not be logged in');
    }
    session.userId = existingUser.id;
    return {
      action: 'login User',
      success: true,
      message: `User ${existingUser.name} with email ${existingUser.email} has been logged in successfully`,
      meta: {
        affectedRows: 1,
        session: {
          userId: session.userId,
        },
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

  @Post('/signout')
  signOut(@Session() session: SessionDto) {
    session.userId = 0;
    return {
      action: 'sign Out',
      success: true,
      message: 'User has been signed out successfully',
      meta: {},
      data: null,
    };
  }

  @Serialize(UserDto)
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

  @Serialize(UserDto)
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

  @Serialize(UserDto)
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

  @Serialize(UserDto)
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
