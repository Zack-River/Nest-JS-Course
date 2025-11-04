import { CurrentUser } from './../../common/decorators/current-user.decorator';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/signin-user.dto';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;
  let users: User[];
  let session: { userId: number } = { userId: 0 };

  beforeEach(async () => {
    users = [];
    session.userId = 0;
    fakeUsersService = {
      findOne(id: number): Promise<User> {
        const user = users.find((u) => u.id === id) as User;
        return Promise.resolve(user);
      },
      findByEmail(email: string): Promise<User> {
        const user = users.find((u) => u.email === email) as User;
        return Promise.resolve(user);
      },
      create(userData: CreateUserDto): Promise<User> {
        const user: User = {
          id: users.length + 1,
          email: userData.email,
          name: userData.name,
          password: userData.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
      update(id: number, attrs: Partial<User>): Promise<User> {
        const user = users.find((u) => u.id === id) as User;
        Object.assign(user, attrs);
        return Promise.resolve(user);
      },
      remove(id: number): Promise<User> {
        const user = users.find((u) => u.id === id) as User;
        users = users.filter((u) => u.id !== id);
        return Promise.resolve(user);
      },
      comparePassword(plain: string, hashed: string): Promise<boolean> {
        return Promise.resolve(plain === hashed);
      },
    };

    fakeAuthService = {
      signup(data: CreateUserDto) {
        return fakeUsersService.create!(data) as Promise<User>;
      },
      async signin(data: LoginUserDto) {
        const user = users.find((u) => u.email === data.email) as User;
        if (!user) throw new Error('User not found');

        const match = await fakeUsersService.comparePassword!(
          data.password,
          user.password,
        );
        if (!match) throw new Error('Password does not match');

        return user;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getUserByEmail should return a user by email', async () => {
    // Arrange
    await fakeUsersService.create!({
      email: 'test@example.com',
      password: '123456',
      name: 'Test User',
    });

    // Act
    const response = await controller.getUserByEmail('test@example.com');

    // Assert
    expect(response).toBeDefined();
    expect(response.data.email).toEqual('test@example.com');
    expect(response.success).toBe(true);
  });

  it('getUserById should return a user by id', async () => {
    // Arrange
    const newUser = (await fakeUsersService.create!({
      email: 'john@example.com',
      password: '654321',
      name: 'John Doe',
    })) as User;

    // Act
    const response = await controller.getUserById(newUser.id);

    // Assert
    expect(response).toBeDefined();
    expect(response.data.id).toEqual(newUser.id);
    expect(response.data.email).toEqual('john@example.com');
  });

  it('getUserById throws an error if user is not found', async () => {
    // Arrange
    const nonExistentUserId = 999;

    // Act & Assert
    await expect(controller.getUserById(nonExistentUserId)).rejects.toThrow(
      'User not found',
    );
  });

  it('getUserByEmail throws an error if user is not found', async () => {
    // Arrange
    const nonExistentUserEmail = 'nonexistent@example.com';

    // Act & Assert
    await expect(
      controller.getUserByEmail(nonExistentUserEmail),
    ).rejects.toThrow('User not found');
  });

  it('createUser should create a user', async () => {
    // Arrange
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: '123456',
      name: 'Test User',
    };

    // Act
    const response = await controller.createUser(createUserDto, session);

    // Assert
    expect(response).toBeDefined();
    expect(response.data.email).toEqual('test@example.com');
    expect(response.success).toBe(true);
  });

  it('loginUser should return a user by email and password', async () => {
    // Arrange
    await fakeUsersService.create!({
      email: 'test@example.com',
      password: '123456',
      name: 'Test User',
    });
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: '123456',
    };

    const response = await controller.loginUser(loginUserDto, session);
    session.userId = response.data.id;
    expect(response).toBeDefined();
    expect(response.data.id).toEqual(1);
    expect(response.data.email).toEqual('test@example.com');
    expect(response.success).toBe(true);
    expect(session.userId).toEqual(1);
  });

  it('whoami should return current logged user', async () => {
    // Arrange
    const newUser = (await fakeUsersService.create!({
      email: 'jane@example.com',
      password: '123456',
      name: 'Jane Doe',
    })) as User;

    const session = { userId: newUser.id };

    // Act
    const response = await controller.whoAmI(newUser);

    // Assert
    expect(response).toBeDefined();
    expect(response.data.id).toEqual(newUser.id);
    expect(response.data.email).toEqual('jane@example.com');
    expect(response.message).toContain('Jane Doe');
  });
});
