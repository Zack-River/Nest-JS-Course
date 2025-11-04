import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/signin-user.dto';

describe('AuthService', () => {
  const users: User[] = [];
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // empty array
    users.length = 0;

    // Create a fake copy of the users service
    fakeUsersService = {
      findByEmail(email: string) {
        const user = users.find((user) => user.email === email);
        return Promise.resolve(user || null);
      },
      create: (userData: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 1000000),
          name: userData.name,
          email: userData.email,
          password: userData.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup({
      email: 'test@test.com',
      password: '123456',
      name: 'Test User',
    });
    expect(user!.password).not.toEqual('123456');
    const [salt, hash] = user!.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with an email that is already in use', async () => {
    await service.signup({
      email: 'test2@test.com',
      password: '123456',
      name: 'Test User',
    });

    await expect(
      service.signup({
        email: 'test2@test.com',
        password: '123456',
        name: 'Test User 2',
      }),
    ).rejects.toThrow();
  });

  it('throws an error if user signs in with unused email', async () => {
    await expect(
      service.signin({
        email: 'test@test.com',
        password: '123456',
      } as LoginUserDto),
    ).rejects.toThrow();
  });

  it('throws if invalid password is provided', async () => {
    await service.signup({
      email: 'asdlkfhlaskalskj@test.com',
      password: 'password',
      name: 'Test User',
    });

    await expect(
      service.signin({
        email: 'asdlkfhlaskalskj@test.com',
        password: 'skjadhkash',
      }),
    ).rejects.toThrow();
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup({
      email: 'test2@test.com',
      password: '123456',
      name: 'Test User',
    } as CreateUserDto);

    const user = await service.signin({
      email: 'test2@test.com',
      password: '123456',
    } as LoginUserDto);
    expect(user).toBeDefined();
  });
});
