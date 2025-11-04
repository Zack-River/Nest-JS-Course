# NestJS Complete Developer Guide - Full Reference

> A comprehensive guide covering NestJS fundamentals from scratch to integration testing. This reference includes detailed explanations, examples, and best practices for building scalable server-side applications.

---

## Table of Contents

1. [Introduction to NestJS](#1-introduction-to-nestjs)
2. [Project Setup](#2-project-setup)
3. [Controllers](#3-controllers)
4. [Services and Dependency Injection](#4-services-and-dependency-injection)
5. [Modules](#5-modules)
6. [Data Transfer Objects (DTOs)](#6-data-transfer-objects-dtos)
7. [Validation](#7-validation)
8. [Database Integration with TypeORM](#8-database-integration-with-typeorm)
9. [Authentication & Sessions](#9-authentication--sessions)
10. [Interceptors](#10-interceptors)
11. [Guards](#11-guards)
12. [Custom Decorators](#12-custom-decorators)
13. [Testing](#13-testing)

---

## 1. Introduction to NestJS

### What is NestJS?

NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It uses TypeScript by default and combines elements of:

- **OOP (Object-Oriented Programming)**
- **FP (Functional Programming)**
- **FRP (Functional Reactive Programming)**

### Key Features

- Built with TypeScript (supports JavaScript)
- Uses decorators extensively
- Modular architecture
- Dependency Injection system
- Built-in support for testing
- Platform agnostic (Express or Fastify)

### Why NestJS?

- **Structure**: Provides a well-defined structure out of the box
- **Scalability**: Built for enterprise-level applications
- **TypeScript**: Full TypeScript support with type safety
- **Testing**: First-class support for unit and integration testing
- **Documentation**: Excellent official documentation

---

## 2. Project Setup

### Two Ways to Create a NestJS Project

#### Method 1: From Scratch (Manual Setup)

```bash
# Create project directory
mkdir my-project
cd my-project

# Initialize npm
npm init -y

# Install dependencies
npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata typescript
```

**Required `package.json` configuration:**

```json
{
  "name": "01-scratch",
  "version": "1.0.0",
  "type": "commonjs",
  "dependencies": {
    "@nestjs/common": "^7.6.17",
    "@nestjs/core": "^7.6.17",
    "@nestjs/platform-express": "^7.6.17",
    "reflect-metadata": "^0.1.13",
    "typescript": "^4.3.2"
  }
}
```

**Required `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2017",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**Key TypeScript Options:**
- `experimentalDecorators`: Enables decorator syntax (@Controller, @Get, etc.)
- `emitDecoratorMetadata`: Allows NestJS to understand types for dependency injection

#### Method 2: Using Nest CLI (Recommended)

```bash
# Install Nest CLI globally
npm install -g @nestjs/cli

# Create new project
nest new my-project

# Navigate to project
cd my-project

# Start development server
npm run start:dev
```

**CLI Advantages:**
- Automatic project structure
- Pre-configured TypeScript
- Testing setup included
- Development scripts ready
- Hot reload enabled

---

## 3. Controllers

### What are Controllers?

Controllers handle incoming HTTP requests and return responses to the client. They define routes and their corresponding request handlers.

### Basic Controller Example

**File: `src/controllers/app.controller.ts`**

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get('/api/v1/hello')
    getHello(): string {
        return 'Hello World!';
    }

    @Get('/api/v1/bye')
    getGoodbye(): string {
        return 'Goodbye World!';
    }
}
```

### Controller Decorators Explained

#### `@Controller()`

Marks a class as a controller and optionally defines a route prefix.

```typescript
// No prefix - routes start from root
@Controller()
export class AppController {}

// With prefix - all routes start with '/users'
@Controller('users')
export class UsersController {}
```

#### HTTP Method Decorators

```typescript
import { Controller, Get, Post, Patch, Delete } from '@nestjs/common';

@Controller('messages')
export class MessagesController {
    @Get('/')              // GET /messages
    listMessages() {}

    @Get('/:id')           // GET /messages/:id
    getMessage() {}

    @Post('/')             // POST /messages
    createMessage() {}

    @Patch('/:id')         // PATCH /messages/:id
    updateMessage() {}

    @Delete('/:id')        // DELETE /messages/:id
    deleteMessage() {}
}
```

### Extracting Request Data

#### Path Parameters (`@Param`)

```typescript
@Get('/:id')
getMessage(@Param('id') id: string) {
    return `Getting message with id: ${id}`;
}

// Multiple parameters
@Get('/:userId/posts/:postId')
getUserPost(
    @Param('userId') userId: string,
    @Param('postId') postId: string
) {
    return `User ${userId}, Post ${postId}`;
}
```

#### Query Parameters (`@Query`)

```typescript
@Get('/')
searchMessages(@Query('email') email: string) {
    return `Searching for: ${email}`;
}

// Multiple query params
// GET /users?email=test@test.com&name=John
@Get('/')
searchUsers(
    @Query('email') email: string,
    @Query('name') name: string
) {
    return { email, name };
}
```

#### Request Body (`@Body`)

```typescript
@Post('/')
createMessage(@Body() body: any) {
    return `Creating message: ${body.content}`;
}

// Specific property
@Post('/')
createMessage(@Body('content') content: string) {
    return `Creating message: ${content}`;
}
```

### Complete Controller Example

```typescript
import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    Query,
    NotFoundException 
} from '@nestjs/common';

@Controller('messages')
export class MessagesController {
    @Get('/')
    listMessages() {
        return { messages: [] };
    }

    @Get('/:id')
    getMessage(@Param('id') id: string) {
        const message = this.findMessage(id);
        if (!message) {
            throw new NotFoundException('Message not found');
        }
        return message;
    }

    @Post('/')
    createMessage(@Body() body: any) {
        return { id: 1, content: body.content };
    }
}
```

---

## 4. Services and Dependency Injection

### What are Services?

Services contain business logic and can be shared across multiple controllers. They are marked with the `@Injectable()` decorator.

### Basic Service Example

**File: `messages.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesService {
    private messages = [];

    async findOne(id: number) {
        return this.messages.find(msg => msg.id === id);
    }

    async findAll() {
        return this.messages;
    }

    async create(content: string) {
        const id = Math.floor(Math.random() * 999);
        const message = { id, content };
        this.messages.push(message);
        return message;
    }
}
```

### Dependency Injection (DI)

Dependency Injection is a design pattern where dependencies are provided to a class rather than the class creating them itself.

#### Why Use DI?

1. **Testability**: Easy to mock dependencies in tests
2. **Maintainability**: Changes to dependencies don't require changing the dependent class
3. **Reusability**: Services can be shared across multiple controllers
4. **Loose Coupling**: Classes don't create their own dependencies

#### How DI Works in NestJS

```typescript
// 1. Mark service as injectable
@Injectable()
export class MessagesService {}

// 2. Inject in controller constructor
@Controller('messages')
export class MessagesController {
    constructor(private messagesService: MessagesService) {}
    //          ^^^^^^^ TypeScript shorthand:
    //          Automatically creates a private property

    @Get('/')
    listMessages() {
        return this.messagesService.findAll();
    }
}

// 3. Register in module
@Module({
    controllers: [MessagesController],
    providers: [MessagesService], // ← Tells NestJS this can be injected
})
export class MessagesModule {}
```

### Repository Pattern

Separating data access logic into repositories makes code more maintainable.

**File: `messages.repository.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';

@Injectable()
export class MessagesRepository {
    private async ensureFileExists() {
        try {
            await readFile('messages.json', 'utf8');
        } catch {
            await writeFile('messages.json', JSON.stringify({}));
        }
    }

    async findOne(id: number) {
        await this.ensureFileExists();
        const contents = await readFile('messages.json', 'utf8');
        const messages = JSON.parse(contents);
        return messages[id];
    }

    async findAll() {
        await this.ensureFileExists();
        const contents = await readFile('messages.json', 'utf8');
        return JSON.parse(contents);
    }

    async create(content: string) {
        await this.ensureFileExists();
        const contents = await readFile('messages.json', 'utf8');
        const messages = JSON.parse(contents);
        
        const id = Math.floor(Math.random() * 999);
        messages[id] = { id, content };
        
        await writeFile('messages.json', JSON.stringify(messages));
    }
}
```

**Service using Repository:**

```typescript
@Injectable()
export class MessagesService {
    constructor(private messageRepo: MessagesRepository) {}

    async findOne(id: number) {
        return this.messageRepo.findOne(id);
    }

    async findAll() {
        return this.messageRepo.findAll();
    }

    async create(content: string) {
        return this.messageRepo.create(content);
    }
}
```

---

## 5. Modules

### What are Modules?

Modules organize the application structure by grouping related controllers and providers together.

### Basic Module Structure

```typescript
import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './messages.repository';

@Module({
    controllers: [MessagesController],  // HTTP handlers
    providers: [MessagesService, MessagesRepository], // Injectable services
    imports: [],      // Other modules this module depends on
    exports: [],      // Services this module shares with other modules
})
export class MessagesModule {}
```

### Root Module (App Module)

Every application has a root module that ties everything together.

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
    imports: [
        UsersModule,
        ReportsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
```

### Module Communication Example

**Power Module** (shared service):

```typescript
// power.service.ts
@Injectable()
export class PowerService {
    usedPower: number = 0;
    
    supplyPower(watts: number): string {
        this.usedPower += watts;
        return `Power supplied: ${watts} watts`;
    }

    getUsedPower(): number {
        return this.usedPower;
    }
}

// power.module.ts
@Module({
    providers: [PowerService],
    exports: [PowerService], // ← Makes it available to other modules
})
export class PowerModule {}
```

**CPU Module** (uses PowerService):

```typescript
// cpu.service.ts
@Injectable()
export class CpuService {
    constructor(private powerService: PowerService) {}

    compute(...args: number[]): string {
        const powerInfo = this.powerService.supplyPower(args.length * 100);
        return `Computation performed. ${powerInfo}`;
    }
}

// cpu.module.ts
@Module({
    providers: [CpuService],
    imports: [PowerModule], // ← Import to use PowerService
    exports: [CpuService],
})
export class CpuModule {}
```

**Computer Module** (uses both):

```typescript
// computer.service.ts
@Injectable()
export class ComputerService {
    constructor(
        private cpuService: CpuService,
        private diskService: DiskService,
        private powerService: PowerService
    ) {}

    run(): string {
        const cpuResult = this.cpuService.compute(1, 2);
        const diskResult = this.diskService.getData();
        const powerResult = this.powerService.getUsedPower();
        return `Computer is running:\n${cpuResult}\n${diskResult}\n${powerResult} watts used`;
    }
}

// computer.module.ts
@Module({
    providers: [ComputerService],
    imports: [CpuModule, DiskModule, PowerModule],
    controllers: [ComputerController]
})
export class ComputerModule {}
```

---

## 6. Data Transfer Objects (DTOs)

### What are DTOs?

DTOs define the shape of data for requests and responses. They provide type safety and documentation.

### Creating DTOs

**File: `create-user.dto.ts`**

```typescript
export class CreateUserDto {
    name: string;
    email: string;
    password: string;
}
```

### Using DTOs in Controllers

```typescript
@Post('/register')
createUser(@Body() user: CreateUserDto) {
    // TypeScript now knows the shape of 'user'
    console.log(user.name, user.email, user.password);
    return this.usersService.create(user);
}
```

### Response DTOs

**File: `user.dto.ts`**

```typescript
export class UserDto {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    // Notice: password is NOT included
}
```

---

## 7. Validation

### Installing Validation Dependencies

```bash
npm install class-validator class-transformer
```

### Validation Decorators

**File: `create-user.dto.ts`**

```typescript
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEmail()
    @IsString()
    email: string;
    
    @MinLength(6)
    @IsString()
    password: string;
}
```

### Common Validators

```typescript
import {
    IsString,
    IsNumber,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    MinLength,
    MaxLength,
    Min,
    Max,
    IsBoolean,
    IsDate,
    IsArray,
    IsEnum,
} from 'class-validator';

export class ExampleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    age: number;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    middleName?: string;

    @MinLength(8)
    @MaxLength(20)
    password: string;

    @IsBoolean()
    isActive: boolean;

    @IsArray()
    @IsString({ each: true })
    tags: string[];

    @IsEnum(['admin', 'user', 'guest'])
    role: string;
}
```

### Enabling Global Validation

**File: `main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip properties not in DTO
            forbidNonWhitelisted: true, // Throw error if extra properties
            transform: true, // Auto-transform payloads to DTO instances
        }),
    );
    
    await app.listen(3000);
}
bootstrap();
```

### Update DTOs with Optional Fields

```typescript
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;
    
    @IsOptional()
    @IsEmail()
    @IsString()
    email?: string;

    @IsOptional()
    @MinLength(6)
    @IsString()
    password?: string;
}
```

---

## 8. Database Integration with TypeORM

### Installing TypeORM and SQLite

```bash
npm install @nestjs/typeorm typeorm sqlite3
```

### Creating Entities

**File: `user.entity.ts`**

```typescript
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    AfterInsert,
    AfterUpdate,
    AfterRemove,
} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @AfterInsert()
    logInsert() {
        console.log(`Inserted user with id ${this.id}`);
    }

    @AfterUpdate()
    logUpdate() {
        console.log(`Updated user with id ${this.id}`);
    }

    @AfterRemove()
    logRemove() {
        console.log(`Removed user with id ${this.id}`);
    }
}
```

### Common Column Options

```typescript
@Entity()
export class Example {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    middleName: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'datetime' })
    createdAt: Date;
}
```

### Configuring TypeORM in Module

**File: `app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/user.entity';
import { Report } from './modules/reports/report.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'db.sqlite',
            entities: [User, Report],
            synchronize: true, // ⚠️ Only for development!
        }),
        UsersModule,
        ReportsModule,
    ],
})
export class AppModule {}
```

### Using Repository in Service

**File: `users.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private repo: Repository<User>,
    ) {}

    // Create
    async create(userData: CreateUserDto) {
        const user = this.repo.create(userData);
        return await this.repo.save(user);
    }

    // Find one by ID
    async findOne(id: number) {
        return await this.repo.findOne({ where: { id } });
    }

    // Find by email
    async findByEmail(email: string) {
        return await this.repo.findOne({ where: { email } });
    }

    // Find all
    async findAll() {
        return await this.repo.find();
    }

    // Update
    async update(id: number, attrs: Partial<User>) {
        const user = await this.findOne(id);
        if (!user) {
            throw new Error('User not found');
        }
        Object.assign(user, attrs);
        return await this.repo.save(user);
    }

    // Remove
    async remove(id: number) {
        const user = await this.findOne(id);
        if (!user) {
            throw new Error('User not found');
        }
        return await this.repo.remove(user);
    }
}
```

### Registering Entity in Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
```

---

## 9. Authentication & Sessions

### Installing Session Support

```bash
npm install cookie-session
npm install @types/cookie-session --save-dev
```

### Configuring Sessions

**File: `main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const CookieSession = require('cookie-session');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.use(
        CookieSession({
            name: 'session',
            keys: ['your-secret-key-here'],
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        }),
    );
    
    await app.listen(3000);
}
bootstrap();
```

### Password Hashing Utility

**File: `common/utils/hash.util.ts`**

```typescript
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const hash = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const hashedPassword = (await hash(password, salt, 32)) as Buffer;
    return `${salt}.${hashedPassword.toString('hex')}`;
}

export async function verifyPassword(
    storedPassword: string,
    suppliedPassword: string,
) {
    const [salt, storedHashedPassword] = storedPassword.split('.');
    
    if (!salt || !storedHashedPassword) {
        return false;
    }
    
    const suppliedHashedPassword = (await hash(
        suppliedPassword,
        salt,
        32,
    )) as Buffer;
    
    const storedBuffer = Buffer.from(storedHashedPassword, 'hex');
    
    if (storedBuffer.length !== suppliedHashedPassword.length) {
        return false;
    }
    
    return timingSafeEqual(storedBuffer, suppliedHashedPassword);
}
```

### Authentication Service

**File: `auth.service.ts`**

```typescript
import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { hashPassword, verifyPassword } from '../../common/utils/hash.util';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async signup(data: CreateUserDto) {
        // Check if email already exists
        const existingUser = await this.usersService.findByEmail(data.email);
        if (existingUser) {
            throw new BadRequestException('Email in use');
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Create user
        const user = await this.usersService.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
        });

        return user;
    }

    async signin(data: LoginUserDto) {
        const user = await this.usersService.findByEmail(data.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await verifyPassword(
            user.password,
            data.password
        );
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid password');
        }

        return user;
    }
}
```

### Using Sessions in Controllers

```typescript
import { Controller, Post, Body, Session } from '@nestjs/common';

@Controller('users')
export class UsersController {
    constructor(private authService: AuthService) {}

    @Post('/register')
    async createUser(
        @Body() user: CreateUserDto,
        @Session() session: any,
    ) {
        const newUser = await this.authService.signup(user);
        session.userId = newUser.id; // Store user ID in session
        return newUser;
    }

    @Post('/login')
    async loginUser(
        @Body() user: LoginUserDto,
        @Session() session: any,
    ) {
        const existingUser = await this.authService.signin(user);
        session.userId = existingUser.id;
        return existingUser;
    }

    @Post('/signout')
    signOut(@Session() session: any) {
        session.userId = null;
        return { message: 'Signed out successfully' };
    }
}
```

---

## 10. Interceptors

### What are Interceptors?

Interceptors have access to the request before it reaches the handler and the response before it's sent to the client. They can:

- Transform the response
- Transform the request
- Add extra logic before/after request handling
- Bind extra logic to an exception

### Serialize Interceptor (Excluding Sensitive Data)

**File: `common/interceptors/serialize.interceptor.ts`**

```typescript
import {
    ExecutionContext,
    CallHandler,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

export class SerializeInterceptor implements NestInterceptor {
    constructor(private dto: any) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // Code here runs BEFORE the request handler
        console.log("I'M RUNNING BEFORE THE HANDLER");
        
        return next.handle().pipe(
            map((data: any) => {
                // Code here runs AFTER the request handler
                
                // Transform nested data if exists
                if (data?.data) {
                    const transformedData = plainToClass(this.dto, data.data, {
                        excludeExtraneousValues: true,
                    });
                    return {
                        ...data,
                        data: transformedData,
                    };
                }

                // Transform entire response
                return plainToClass(this.dto, data, {
                    excludeExtraneousValues: true,
                });
            }),
        );
    }
}
```

### Serialize Decorator

**File: `common/decorators/serialize.decorator.ts`**

```typescript
import { UseInterceptors } from '@nestjs/common';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';

interface ClassConstructor {
    new (...args: any[]): {};
}

export function Serialize(dto: ClassConstructor) {
    return UseInterceptors(new SerializeInterceptor(dto));
}
```

### Using Serialize Decorator

**File: `user.dto.ts`**

```typescript
import { Expose } from 'class-transformer';

export class UserDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
    
    // password is NOT exposed - won't be in response
}
```

**In Controller:**

```typescript
import { Serialize } from '../../common/decorators/serialize.decorator';
import { UserDto } from './dtos/user.dto';

@Controller('users')
export class UsersController {
    @Get('/:id')
    @Serialize(UserDto) // ← Automatically excludes password
    async getUserById(@Param('id') id: number) {
        return await this.usersService.findOne(id);
    }
}
```

### Current User Interceptor

**File: `common/interceptors/current-user.interceptor.ts`**

```typescript
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
    constructor(private usersService: UsersService) {}

    async intercept(context: ExecutionContext, handler: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const { session } = request;

        if (!session || !session.userId) {
            return handler.handle();
        }

        const user = await this.usersService.findOne(session.userId);
        if (user) {
            request.currentUser = user;
        }

        return handler.handle();
    }
}
```

### Registering Global Interceptor

**File: `users.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CurrentUserInterceptor } from 'src/common/interceptors/current-user.interceptor';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UsersController],
    providers: [
        UsersService,
        AuthService,
        {
            provide: APP_INTERCEPTOR,
            useClass: CurrentUserInterceptor,
        },
    ],
})
export class UsersModule {}
```

---

## 11. Guards

### What are Guards?

Guards determine whether a request should be handled by the route handler or not. They're used for authorization and authentication checks.

### Creating an Auth Guard

**File: `common/guards/auth.guard.ts`**

```typescript
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const session = request.session;

        if (!session || !session.userId) {
            throw new ForbiddenException('Forbidden resource');
        }

        return true; // Allow access
    }
}
```

### Using Guards in Controllers

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('users')
export class UsersController {
    // Protect single route
    @Get('/whoami')
    @UseGuards(AuthGuard)
    whoAmI(@CurrentUser() user: User) {
        return user;
    }

    // Unprotected route
    @Post('/login')
    login() {
        // Anyone can access
    }
}
```

### Protecting Entire Controller

```typescript
@Controller('admin')
@UseGuards(AuthGuard) // ← All routes in this controller are protected
export class AdminController {
    @Get('/dashboard')
    getDashboard() {
        // Only authenticated users can access
    }

    @Get('/users')
    getUsers() {
        // Only authenticated users can access
    }
}
```

### Role-Based Guard Example

```typescript
import { CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.currentUser;

        if (!user || user.role !== 'admin') {
            throw new ForbiddenException('Admin access required');
        }

        return true;
    }
}
```

---

## 12. Custom Decorators

### What are Custom Decorators?

Custom decorators allow you to extract common logic and make your code more readable and reusable.

### Current User Decorator

**File: `common/decorators/current-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: never, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        return request.currentUser;
    },
);
```

### Using Custom Decorator

```typescript
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
    @Get('/whoami')
    @UseGuards(AuthGuard)
    async whoAmI(@CurrentUser() user: User) {
        // 'user' is automatically extracted from request
        return {
            success: true,
            message: `User ${user.name} is logged in`,
            data: user,
        };
    }
}
```

### How It Works Together

1. **Interceptor** runs first and adds `currentUser` to request
2. **Guard** checks if user is authenticated
3. **Decorator** extracts the user from request for use in handler

```typescript
// Flow:
Request → Interceptor (adds currentUser) → Guard (checks auth) → Decorator (extracts user) → Handler
```

---

## 13. Testing

### Types of Tests in NestJS

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test how components work together
3. **E2E Tests**: Test entire application flow

### Unit Testing Services

**File: `auth.service.spec.ts`**

```typescript
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;
    const users: User[] = [];

    beforeEach(async () => {
        // Reset users array before each test
        users.length = 0;

        // Create fake UsersService
        fakeUsersService = {
            findByEmail(email: string) {
                const user = users.find((user) => user.email === email);
                return Promise.resolve(user || null);
            },
            create(userData: CreateUserDto) {
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

        // Create testing module
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

        expect(user.password).not.toEqual('123456');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async () => {
        await service.signup({
            email: 'test@test.com',
            password: '123456',
            name: 'Test User',
        });

        await expect(
            service.signup({
                email: 'test@test.com',
                password: '123456',
                name: 'Test User 2',
            }),
        ).rejects.toThrow();
    });

    it('throws if invalid password is provided', async () => {
        await service.signup({
            email: 'test@test.com',
            password: 'password',
            name: 'Test User',
        });

        await expect(
            service.signin({
                email: 'test@test.com',
                password: 'wrongpassword',
            }),
        ).rejects.toThrow();
    });

    it('returns a user if correct password is provided', async () => {
        await service.signup({
            email: 'test@test.com',
            password: '123456',
            name: 'Test User',
        });

        const user = await service.signin({
            email: 'test@test.com',
            password: '123456',
        });

        expect(user).toBeDefined();
    });
});
```

### Unit Testing Controllers

**File: `users.controller.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
    let controller: UsersController;
    let fakeUsersService: Partial<UsersService>;
    let fakeAuthService: Partial<AuthService>;
    let users: User[];

    beforeEach(async () => {
        users = [];

        fakeUsersService = {
            findOne(id: number): Promise<User> {
                const user = users.find((u) => u.id === id);
                return Promise.resolve(user);
            },
            findByEmail(email: string): Promise<User> {
                const user = users.find((u) => u.email === email);
                return Promise.resolve(user);
            },
            // ... other methods
        };

        fakeAuthService = {
            signup(data: CreateUserDto) {
                return fakeUsersService.create(data) as Promise<User>;
            },
            async signin(data: LoginUserDto) {
                const user = users.find((u) => u.email === data.email);
                if (!user) throw new Error('User not found');
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
        await fakeUsersService.create({
            email: 'test@example.com',
            password: '123456',
            name: 'Test User',
        });

        const response = await controller.getUserByEmail('test@example.com');

        expect(response).toBeDefined();
        expect(response.data.email).toEqual('test@example.com');
        expect(response.success).toBe(true);
    });

    it('getUserById throws an error if user is not found', async () => {
        await expect(controller.getUserById(999)).rejects.toThrow(
            'User not found',
        );
    });
});
```

### Test Structure Best Practices

```typescript
describe('ComponentName', () => {
    let component: ComponentType;
    let dependency: DependencyType;

    beforeEach(async () => {
        // Setup before each test
        // Create fresh instances
    });

    afterEach(() => {
        // Cleanup after each test
    });

    it('should do something specific', () => {
        // Arrange: Set up test data
        const input = 'test';

        // Act: Execute the code being tested
        const result = component.method(input);

        // Assert: Verify the result
        expect(result).toBe('expected');
    });

    it('should handle error cases', () => {
        expect(() => component.method(null)).toThrow();
    });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

---

## Common Patterns and Best Practices

### 1. Consistent Response Structure

Create a standard response format across your API:

```typescript
interface ApiResponse<T> {
    action: string;
    success: boolean;
    message: string;
    meta: {
        affectedRows?: number;
        session?: any;
    };
    data: T | null;
}
```

**Usage:**

```typescript
@Get('/:id')
async getUserById(@Param('id') id: number): Promise<ApiResponse<User>> {
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
```

### 2. Error Handling

NestJS provides built-in exceptions:

```typescript
import {
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';

// Usage examples:
throw new NotFoundException('User not found');
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Please login');
throw new ForbiddenException('Access denied');
throw new InternalServerErrorException('Something went wrong');
```

### 3. Async/Await Pattern

Always use async/await for database operations:

```typescript
// ❌ Bad
@Get('/:id')
getUserById(@Param('id') id: number) {
    return this.usersService.findOne(id);
}

// ✅ Good
@Get('/:id')
async getUserById(@Param('id') id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
        throw new NotFoundException('User not found');
    }
    return user;
}
```

### 4. Dependency Injection Best Practices

```typescript
// ❌ Bad - Creating instances manually
export class UsersController {
    usersService = new UsersService();
}

// ✅ Good - Using DI
export class UsersController {
    constructor(private usersService: UsersService) {}
}
```

### 5. DTO Validation

Always validate input data:

```typescript
// DTO with validation
export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;
}

// Controller using validated DTO
@Post('/register')
async createUser(@Body() user: CreateUserDto) {
    // Data is already validated here
    return this.authService.signup(user);
}
```

### 6. Separation of Concerns

Keep your code organized:

```
src/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── utils/
├── modules/
│   ├── users/
│   │   ├── dtos/
│   │   ├── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── auth.service.ts
│   └── reports/
└── main.ts
```

---

## Request Lifecycle in NestJS

Understanding the order of execution:

```
1. Incoming Request
   ↓
2. Middleware
   ↓
3. Guards (@UseGuards)
   ↓
4. Interceptors (before)
   ↓
5. Pipes (@UsePipes, validation)
   ↓
6. Controller Handler
   ↓
7. Service Methods
   ↓
8. Interceptors (after)
   ↓
9. Exception Filters (if error occurs)
   ↓
10. Response
```

### Example Flow

```typescript
// 1. Request comes in: POST /users/login

// 2. Middleware (if any)
app.use(CookieSession({ ... }));

// 3. Global Interceptor runs (before)
CurrentUserInterceptor.intercept() // Adds user to request

// 4. Validation Pipe runs
ValidationPipe // Validates LoginUserDto

// 5. Controller Handler
@Post('/login')
async loginUser(@Body() user: LoginUserDto, @Session() session: any) {
    // 6. Service method
    const existingUser = await this.authService.signin(user);
    session.userId = existingUser.id;
    return existingUser;
}

// 7. Serialize Interceptor runs (after)
SerializeInterceptor // Removes password from response

// 8. Response sent to client
```

---

## Environment Configuration

### Development vs Production

```typescript
// main.ts
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    // Development settings
    if (process.env.NODE_ENV !== 'production') {
        app.enableCors();
        // Enable detailed error messages
    }
    
    // Production settings
    if (process.env.NODE_ENV === 'production') {
        // Disable synchronize in TypeORM
        // Enable security headers
        // Use environment variables for secrets
    }
    
    await app.listen(process.env.PORT || 3000);
}
```

---

## Useful npm Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

---

## Quick Reference Commands

### NestJS CLI Commands

```bash
# Generate module
nest g module users

# Generate controller
nest g controller users

# Generate service
nest g service users

# Generate complete resource (module, controller, service, DTO)
nest g resource users

# Generate guard
nest g guard auth

# Generate interceptor
nest g interceptor serialize

# Generate decorator
nest g decorator current-user
```

### Common Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run start:dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm run start:prod
```

---

## Key Takeaways

### 1. Architecture
- **Modular**: Organize code into modules
- **DI**: Use dependency injection for loose coupling
- **Separation**: Keep controllers thin, services handle business logic

### 2. Decorators
- **@Controller()**: Define routes
- **@Injectable()**: Make classes injectable
- **@Get/@Post/@Patch/@Delete**: HTTP methods
- **@Body/@Param/@Query**: Extract request data
- **@UseGuards/@UseInterceptors**: Apply middleware

### 3. Data Flow
```
Request → Middleware → Guards → Interceptors → 
Pipes → Controller → Service → Repository → 
Database → Service → Controller → Interceptors → Response
```

### 4. Security
- Hash passwords before storing
- Use sessions for authentication
- Implement guards for protected routes
- Exclude sensitive data from responses
- Validate all input data

### 5. Testing
- Write unit tests for services
- Mock dependencies in tests
- Test both success and error cases
- Use beforeEach for test setup

---

## Next Steps

After completing section 13, you'll move on to:

- **Integration Testing**: Testing how modules work together
- **E2E Testing**: Testing complete application flows
- **Advanced TypeORM**: Relations, migrations, query builders
- **Microservices**: Building distributed systems
- **GraphQL**: Alternative to REST APIs
- **WebSockets**: Real-time communication
- **Caching**: Improving performance
- **Deployment**: Deploying to production

---

## Additional Resources

- **Official Docs**: https://docs.nestjs.com
- **TypeORM Docs**: https://typeorm.io
- **Class Validator**: https://github.com/typestack/class-validator
- **Testing Docs**: https://docs.nestjs.com/fundamentals/testing

---

## Troubleshooting Common Issues

### Issue: Validation Not Working

**Solution**: Make sure ValidationPipe is configured globally:

```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

### Issue: Circular Dependency

**Solution**: Use forwardRef:

```typescript
constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
) {}
```

### Issue: Entity Not Found

**Solution**: Register entity in TypeORM config:

```typescript
TypeOrmModule.forRoot({
    entities: [User, Report], // ← Add here
})
```

### Issue: Session Not Persisting

**Solution**: Check cookie-session configuration:

```typescript
app.use(CookieSession({
    keys: ['secret-key'], // ← Must be set
    maxAge: 24 * 60 * 60 * 1000,
}));
```

---

**Created by**: Your Learning Journey  
**Course**: NestJS: The Complete Developer's Guide (Udemy)  
**Progress**: Sections 1-13 Complete  
**Last Updated**: November 2025