# NestJS Complete Developer Guide - Full Reference

> A comprehensive guide covering NestJS fundamentals from scratch to integration testing. This reference includes detailed explanations, examples, and best practices for building scalable server-side applications.

---

## Table of Contents

### Core Fundamentals (Sections 1-13)
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

### Advanced Topics (Sections 14+)
14. [TypeORM Relations](#14-typeorm-relations)
15. [Query Builders & Advanced Queries](#15-query-builders--advanced-queries)
16. [Database Migrations](#16-database-migrations)
17. [Environment Configuration](#17-environment-configuration)
18. [Middleware](#18-middleware)
19. [End-to-End Testing](#19-end-to-end-testing)
20. [Production Best Practices](#20-production-best-practices)

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

## 14. TypeORM Relations

### Understanding Relations

Relations define how entities are connected to each other in the database. TypeORM supports several types of relationships.

### One-to-Many / Many-to-One

**Scenario**: One user can create many reports, but each report belongs to one user.

**User Entity:**

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Report } from '../reports/report.entity';

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

    @Column({ default: true })
    isAdmin: boolean;

    @OneToMany(() => Report, (report) => report.user)
    reports: Report[];
}
```

**Report Entity:**

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    approved: boolean;

    @Column()
    price: number;

    @Column()
    make: string;

    @Column()
    model: string;

    @Column()
    year: number;

    @Column()
    lng: number;

    @Column()
    lat: number;

    @Column()
    mileage: number;

    @ManyToOne(() => User, (user) => user.reports)
    user: User;
}
```

### Creating Related Records

```typescript
@Injectable()
export class ReportsService {
    constructor(@InjectRepository(Report) private repo: Repository<Report>) {}
    
    async create(reportDto: CreateReportDto, user: User): Promise<Report> {
        const report = this.repo.create(reportDto);
        report.user = user; // Associate with user
        return await this.repo.save(report);
    }
}
```

### Transforming Relations in DTOs

Use `@Transform` to control how relations appear in responses:

```typescript
import { Expose, Transform } from 'class-transformer';

export class ReportDto {
    @Expose() 
    id: number;
    
    @Expose() 
    price: number;
    
    @Expose() 
    make: string;

    // Extract only the user ID from the relation
    @Transform(({ obj }) => obj.user?.id ?? null)
    @Expose()
    userId: number;
}
```

### Key Concepts

- `@OneToMany()`: Defines the "one" side of the relationship
- `@ManyToOne()`: Defines the "many" side of the relationship
- The `@ManyToOne()` side actually stores the foreign key
- Always specify both directions of the relationship for TypeORM to work properly

---

## 15. Query Builders & Advanced Queries

### What are Query Builders?

Query builders provide a powerful way to construct complex SQL queries programmatically.

### Basic Query Builder

```typescript
const reports = await this.repo
    .createQueryBuilder('report')
    .select('*')
    .where('report.approved = :approved', { approved: true })
    .getMany();
```

### Advanced Query Example: Price Estimation

This query calculates an average price based on similar vehicles:

```typescript
async createEstimate(query: GetEstimateDto) {
    const { make, model, year, lng, lat, mileage } = query;

    return this.repo
        .createQueryBuilder('report')
        .select('AVG(price)', 'price') // Calculate average price
        .where('make = :make', { make })
        .andWhere('model = :model', { model })
        .andWhere('lng - :lng BETWEEN -5 AND 5', { lng }) // Within 5 degrees longitude
        .andWhere('lat - :lat BETWEEN -5 AND 5', { lat }) // Within 5 degrees latitude
        .andWhere('year - :year BETWEEN -3 AND 3', { year }) // Within 3 years
        .andWhere('approved IS TRUE') // Only approved reports
        .orderBy('mileage - :mileage', 'DESC') // Closest mileage first
        .setParameters({ mileage })
        .limit(3) // Top 3 matches
        .getRawOne(); // Return single aggregated result
}
```

### Query Builder Methods

```typescript
// Selecting
.select('user.id', 'userId')
.select('AVG(price)', 'avgPrice')

// Filtering
.where('user.name = :name', { name: 'John' })
.andWhere('user.age > :age', { age: 18 })
.orWhere('user.isAdmin = :admin', { admin: true })

// Joining
.leftJoin('user.reports', 'report')
.innerJoin('user.profile', 'profile')

// Ordering
.orderBy('user.createdAt', 'DESC')
.addOrderBy('user.name', 'ASC')

// Limiting
.limit(10)
.offset(20)

// Grouping
.groupBy('user.role')
.having('COUNT(user.id) > :count', { count: 5 })

// Execution
.getMany()    // Get array of entities
.getOne()     // Get single entity
.getRawOne()  // Get raw data object
.getRawMany() // Get array of raw data
```

### DTO with Transform for Query Parameters

When accepting query parameters, use `@Transform` to convert strings to proper types:

```typescript
import { Transform } from 'class-transformer';
import { IsNumber, IsString, Min, Max } from 'class-validator';

export class GetEstimateDto {
    @Transform(({ value }) => value.trim())
    @IsString()
    make: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    model: string;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    year: number;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(-180)
    @Max(180)
    lng: number;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(-90)
    @Max(90)
    lat: number;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    @Max(1000000)
    mileage: number;
}
```

**Why Transform?** Query parameters come as strings from the URL. `@Transform` converts them to the correct type before validation.

---

## 16. Database Migrations

### Why Use Migrations?

In production, you should **NEVER** use `synchronize: true`. Instead, use migrations to:

- Track database schema changes over time
- Apply changes in a controlled, versioned manner
- Roll back changes if needed
- Work safely in team environments

### Setting Up Migrations

**1. Create DataSource configuration:**

**File: `data-source.ts`**

```typescript
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: process.env.NODE_ENV === 'test' ? 'test.sqlite' : 'db.sqlite',
    entities: [path.join(__dirname, '**/*.entity.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
    synchronize: false, // ← ALWAYS false in production
});
```

**2. Update app.module.ts:**

```typescript
import { AppDataSource } from '../data-source';

@Module({
    imports: [
        TypeOrmModule.forRoot(AppDataSource.options),
        // ... other modules
    ],
})
export class AppModule {}
```

**3. Add migration scripts to package.json:**

```json
{
    "scripts": {
        "typeorm": "cross-env NODE_ENV=development node --require ts-node/register ./node_modules/typeorm/cli.js",
        "migration:generate": "npm run typeorm migration:generate",
        "migration:run": "npm run typeorm migration:run",
        "migration:revert": "npm run typeorm migration:revert"
    }
}
```

### Creating Migrations

```bash
# Generate migration from entity changes
npm run migration:generate -- -d data-source.ts src/migrations/initial-schema

# Run pending migrations
npm run migration:run -- -d data-source.ts

# Revert last migration
npm run migration:revert -- -d data-source.ts
```

### Example Migration File

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762448516932 implements MigrationInterface {
    name = 'InitialSchema1762448516932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tables and columns
        await queryRunner.query(`CREATE TABLE "user" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, 
            "name" varchar NOT NULL, 
            "email" varchar NOT NULL, 
            "password" varchar NOT NULL, 
            "isAdmin" boolean NOT NULL DEFAULT (1),
            CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")
        )`);
        
        await queryRunner.query(`CREATE TABLE "report" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "approved" boolean NOT NULL DEFAULT (0),
            "price" integer NOT NULL,
            "userId" integer,
            CONSTRAINT "FK_e347c56b008c2057c9887e230aa" 
            FOREIGN KEY ("userId") REFERENCES "user" ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse the changes
        await queryRunner.query(`DROP TABLE "report"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
```

### Migration Best Practices

1. **Never edit existing migrations** - Create new ones for changes
2. **Always test migrations** in development first
3. **Backup production database** before running migrations
4. **Keep migrations small** - One logical change per migration
5. **Review generated SQL** before running

---

## 17. Environment Configuration

### Using ConfigModule

**1. Install dependencies:**

```bash
npm install @nestjs/config
```

**2. Create environment files:**

```bash
# .env.development
NODE_ENV=development
COOKIE_KEY=development-secret-key
DATABASE_NAME=db.sqlite

# .env.test
NODE_ENV=test
COOKIE_KEY=test-secret-key
DATABASE_NAME=test.sqlite

# .env.production
NODE_ENV=production
COOKIE_KEY=super-secure-production-key
DATABASE_NAME=production.sqlite
```

**3. Configure in app.module.ts:**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Make config available everywhere
            envFilePath: `.env.${process.env.NODE_ENV}`, // Load correct env file
        }),
        // ... other imports
    ],
})
export class AppModule {
    constructor(private configService: ConfigService) {}
    
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(
                CookieSession({
                    keys: [this.configService.get<string>('COOKIE_KEY')],
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                }),
            )
            .forRoutes('*');
    }
}
```

**4. Update data-source.ts:**

```typescript
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: process.env.NODE_ENV === 'test' ? 'test.sqlite' : 'db.sqlite',
    entities: [path.join(__dirname, '**/*.entity.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
    synchronize: false,
});
```

**5. Update package.json scripts:**

```json
{
    "scripts": {
        "start": "cross-env NODE_ENV=development nest start",
        "start:dev": "cross-env NODE_ENV=development nest start --watch",
        "start:prod": "cross-env NODE_ENV=production node dist/main",
        "test": "cross-env NODE_ENV=test jest",
        "test:e2e": "cross-env NODE_ENV=test jest --config ./test/jest-e2e.json"
    }
}
```

### Using Config Service

```typescript
@Injectable()
export class SomeService {
    constructor(private configService: ConfigService) {}
    
    someMethod() {
        const apiKey = this.configService.get<string>('API_KEY');
        const port = this.configService.get<number>('PORT');
        const isDev = this.configService.get('NODE_ENV') === 'development';
    }
}
```

### Environment-Specific Configuration

```typescript
// main.ts
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    const configService = app.get(ConfigService);
    const port = configService.get('PORT') || 3000;
    
    // Development only
    if (configService.get('NODE_ENV') === 'development') {
        app.enableCors();
    }
    
    // Production only
    if (configService.get('NODE_ENV') === 'production') {
        // Enable security features
        app.enableCors({
            origin: configService.get('ALLOWED_ORIGINS'),
            credentials: true,
        });
    }
    
    await app.listen(port);
}
```

---

## 18. Middleware

### What is Middleware?

Middleware functions execute before route handlers and can:
- Execute any code
- Modify request/response objects
- End the request-response cycle
- Call the next middleware function

### Creating Middleware

**File: `common/middlewares/current-user.middleware.ts`**

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../../modules/users/users.service';
import { User } from 'src/modules/users/user.entity';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            currentUser?: User;
        }
    }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
    constructor(private usersService: UsersService) {}
    
    async use(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.session || {};
        
        if (userId) {
            const user = await this.usersService.findOne(userId);
            if (user) {
                req.currentUser = user;
            }
        }
        
        next(); // Pass control to next middleware/handler
    }
}
```

### Applying Middleware

**In Module:**

```typescript
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { CurrentUserMiddleware } from '../../common/middlewares/current-user.middleware';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UsersController],
    providers: [UsersService, AuthService],
})
export class UsersModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(CurrentUserMiddleware)
            .forRoutes('*'); // Apply to all routes
            
        // Or specific routes:
        // .forRoutes({ path: 'users', method: RequestMethod.GET })
    }
}
```

### Middleware vs Interceptors

**Use Middleware when:**
- You need access to raw request/response objects
- You want to modify request before it reaches NestJS pipeline
- You need to work with sessions early in the request cycle

**Use Interceptors when:**
- You need access to the execution context
- You want to transform the response
- You need to bind extra logic to methods
- You want to use NestJS dependency injection fully

---

## 19. End-to-End Testing

### What is E2E Testing?

E2E tests verify that the entire application works correctly from start to finish, testing the full request/response cycle.

### Setting Up E2E Tests

**File: `test/setup.ts`**

```typescript
import { rm } from 'fs/promises';
import { join } from 'path';

global.beforeEach(async () => {
    try {
        // Delete test database before each test
        await rm(join(__dirname, '..', 'test.sqlite'));
    } catch (error) {
        // File might not exist, ignore error
    }
});
```

**File: `test/jest-e2e.json`**

```json
{
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "../",
    "testEnvironment": "node",
    "testRegex": ".e2e-spec.ts$",
    "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    "setupFilesAfterEnv": ["<rootDir>/test/setup.ts"]
}
```

### Writing E2E Tests

**File: `test/auth.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('handles a signup request', () => {
        const email = 'test@test.com';
        
        return request(app.getHttpServer())
            .post('/users/register')
            .send({
                name: 'Test User',
                email: email,
                password: '123456',
            })
            .expect(201)
            .then((res) => {
                const { id, email: returnedEmail } = res.body.data;
                expect(id).toBeDefined();
                expect(returnedEmail).toEqual(email);
            });
    });

    it('signup as a new user then get the currently logged in user', async () => {
        const email = 'test@test.com';

        // Signup
        const signupResponse = await request(app.getHttpServer())
            .post('/users/register')
            .send({
                name: 'Test User',
                email: email,
                password: '123456',
            })
            .expect(201);

        // Get cookie from signup response
        const cookie = signupResponse.get('Set-Cookie');

        // Make authenticated request
        const { body } = await request(app.getHttpServer())
            .get('/users/whoami')
            .set('Cookie', cookie ?? [])
            .expect(200);

        expect(body.data.email).toEqual(email);
    });
});
```

### Testing with Sessions

```typescript
it('maintains session across requests', async () => {
    // 1. Login
    const loginRes = await request(app.getHttpServer())
        .post('/users/login')
        .send({ email: 'test@test.com', password: '123456' })
        .expect(200);
    
    // 2. Extract cookie
    const cookie = loginRes.get('Set-Cookie');
    
    // 3. Use cookie in subsequent requests
    await request(app.getHttpServer())
        .get('/users/whoami')
        .set('Cookie', cookie)
        .expect(200);
});
```

### Running E2E Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run with coverage
npm run test:e2e -- --coverage

# Run specific test file
npm run test:e2e -- auth.e2e-spec.ts
```

### E2E Testing Best Practices

1. **Isolate tests** - Each test should be independent
2. **Clean database** - Start with fresh database for each test
3. **Use real database** - Don't mock database in E2E tests
4. **Test happy paths** - Focus on main user workflows
5. **Test error cases** - Verify error handling works correctly

---

## 20. Production Best Practices

### Security

**1. Environment Variables**

```typescript
// ❌ Never hardcode secrets
const cookieKey = 'my-secret-key';

// ✅ Use environment variables
const cookieKey = this.configService.get('COOKIE_KEY');
```

**2. Disable synchronize in production**

```typescript
TypeOrmModule.forRoot({
    type: 'sqlite',
    database: 'db.sqlite',
    entities: [User, Report],
    synchronize: process.env.NODE_ENV !== 'production', // ← Only in dev
});
```

**3. Use secure cookies**

```typescript
CookieSession({
    keys: [process.env.COOKIE_KEY],
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    maxAge: 24 * 60 * 60 * 1000,
});
```

### Error Handling

**Global Exception Filter:**

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : 500;

        const message = exception instanceof HttpException
            ? exception.getResponse()
            : 'Internal server error';

        // Log error in production
        if (process.env.NODE_ENV === 'production') {
            console.error('Error:', exception);
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: process.env.NODE_ENV === 'production' 
                ? 'An error occurred' 
                : message,
        });
    }
}
```

### Performance

**1. Database Indexing**

```typescript
@Entity()
export class User {
    @Column({ unique: true })
    @Index() // ← Add index for faster lookups
    email: string;
}
```

**2. Pagination**

```typescript
async findAll(page: number = 1, limit: number = 10) {
    return await this.repo.find({
        skip: (page - 1) * limit,
        take: limit,
    });
}
```

**3. Select Only Needed Fields**

```typescript
const users = await this.repo
    .createQueryBuilder('user')
    .select(['user.id', 'user.name', 'user.email']) // Don't fetch password
    .getMany();
```

### Logging

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    async create(userData: CreateUserDto) {
        this.logger.log(`Creating user with email: ${userData.email}`);
        
        try {
            const user = await this.repo.save(userData);
            this.logger.log(`User created successfully: ${user.id}`);
            return user;
        } catch (error) {
            this.logger.error(`Failed to create user: ${error.message}`, error.stack);
            throw error;
        }
    }
}
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for all secrets
- [ ] Disable `synchronize` in TypeORM
- [ ] Run database migrations
- [ ] Enable HTTPS
- [ ] Set secure cookie options
- [ ] Add rate limiting
- [ ] Configure CORS properly
- [ ] Set up logging
- [ ] Add health check endpoint
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Test in production-like environment
- [ ] Set up monitoring

### Health Check Endpoint

```typescript
@Controller('health')
export class HealthController {
    constructor(private configService: ConfigService) {}

    @Get()
    check() {
        return {
            status: 'ok',
            environment: this.configService.get('NODE_ENV'),
            timestamp: new Date().toISOString(),
        };
    }
}
```

---

## Advanced Patterns

### Custom Response DTO Class

Create reusable response structure:

```typescript
// common/dtos/api-response.dto.ts
export class ApiResponse<T = unknown> {
    action: string;
    success: boolean;
    message: string;
    meta: MetaDto;
    data: T;

    static success<T>(
        action: string,
        message: string,
        data: T,
        meta: Partial<MetaDto> = {},
    ): ApiResponse<T> {
        return new ApiResponse(
            action,
            true,
            message,
            {
                affectedRows: meta.affectedRows ?? 0,
                session: meta.session ?? { userId: 0 },
                timestamp: meta.timestamp ?? new Date(),
            },
            data,
        );
    }

    static error<T = null>(
        action: string,
        message: string,
        meta: Partial<MetaDto> = {},
    ): ApiResponse<T> {
        return new ApiResponse(
            action,
            false,
            message,
            {
                affectedRows: 0,
                session: meta.session ?? { userId: 0 },
                timestamp: new Date(),
            },
            null as T,
        );
    }
}
```

**Usage:**

```typescript
@Post()
async createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    const report = await this.reportsService.create(body, user);
    
    return ApiResponse.success(
        'createReport',
        'Report created successfully',
        report,
        { affectedRows: 1, session: { userId: user.id } }
    );
}
```

### Admin Guard

```typescript
// common/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.currentUser;
        
        if (!user) {
            throw new ForbiddenException('You must be logged in');
        }
        
        if (!user.isAdmin) {
            throw new ForbiddenException('Only admins can access this resource');
        }
        
        return true;
    }
}
```

**Usage:**

```typescript
@Patch('/:id')
@UseGuards(AdminGuard)
async approveReport(@Param('id') id: number, @Body() body: ApproveReportDto) {
    // Only admins can reach this endpoint
    return await this.reportsService.changeApproval(id, body.approved);
}
```

### Combining Multiple Decorators

```typescript
// Create composite decorator
export function Auth() {
    return applyDecorators(
        UseGuards(AuthGuard),
        Serialize(UserDto),
    );
}

// Usage
@Controller('users')
export class UsersController {
    @Get('/profile')
    @Auth() // ← Applies both guard and serialization
    getProfile(@CurrentUser() user: User) {
        return user;
    }
}
```

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

## Course Complete! 🎉

### What You've Learned

You've completed a comprehensive journey through NestJS, covering:

**Fundamentals:**
- ✅ Project setup and architecture
- ✅ Controllers, services, and modules
- ✅ Dependency injection system
- ✅ DTOs and validation
- ✅ TypeORM database integration

**Authentication & Security:**
- ✅ User authentication with sessions
- ✅ Password hashing and verification
- ✅ Guards for route protection
- ✅ Custom decorators
- ✅ Role-based authorization

**Advanced Database:**
- ✅ Entity relations (One-to-Many, Many-to-One)
- ✅ Query builders and complex queries
- ✅ Database migrations
- ✅ Production-safe database management

**Testing & Quality:**
- ✅ Unit testing with Jest
- ✅ Mocking dependencies
- ✅ E2E testing strategies
- ✅ Test isolation and database cleanup

**Production Readiness:**
- ✅ Environment configuration
- ✅ Middleware implementation
- ✅ Error handling patterns
- ✅ Security best practices
- ✅ Performance optimization

### Your Projects

**1. Messages App** (`02-CLI/messages/`)
- Basic CRUD operations
- File-based storage
- Repository pattern

**2. Computer System** (`02-CLI/computer/`)
- Module communication
- Shared services
- Dependency injection

**3. Car Pricing API** (`02-CLI/car-pricing-api/`)
- Full authentication system
- User and report management
- Advanced query builders
- Database migrations
- E2E tests
- Production configuration

### Key Architectural Patterns You've Mastered

```typescript
// 1. Dependency Injection
@Injectable()
export class MyService {
    constructor(private repo: Repository<Entity>) {}
}

// 2. Decorator-Based Design
@Controller('users')
@UseGuards(AuthGuard)
@Serialize(UserDto)
export class UsersController {}

// 3. Repository Pattern
Service → Repository → Database

// 4. Middleware Pipeline
Request → Middleware → Guard → Interceptor → Handler → Interceptor → Response

// 5. Testing Strategies
Unit Tests + Integration Tests + E2E Tests = Confidence
```

### Real-World Skills Gained

1. **API Design**: RESTful endpoints with proper HTTP methods
2. **Database Management**: Relations, queries, migrations
3. **Security**: Authentication, authorization, data protection
4. **Testing**: Comprehensive test coverage strategies
5. **Configuration**: Environment-based setup
6. **Error Handling**: Graceful error management
7. **Code Organization**: Modular, maintainable structure

---

## Next Steps & Further Learning

### Immediate Practice

1. **Build Your Own Project**: Apply everything you've learned
   - E-commerce API
   - Blog platform
   - Task management system
   - Social media backend

2. **Enhance Car Pricing API**:
   - Add user profiles
   - Implement pagination
   - Add search functionality
   - Create admin dashboard
   - Add email notifications

### Advanced Topics to Explore

**Microservices:**
```typescript
// Message-based communication between services
@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'MATH_SERVICE',
                transport: Transport.TCP,
            },
        ]),
    ],
})
```

**GraphQL:**
```typescript
// Type-safe API queries
@Resolver(() => User)
export class UserResolver {
    @Query(() => User)
    async user(@Args('id') id: string) {
        return this.userService.findOne(id);
    }
}
```

**WebSockets:**
```typescript
// Real-time communication
@WebSocketGateway()
export class EventsGateway {
    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: any) {
        this.server.emit('message', payload);
    }
}
```

**Caching:**
```typescript
// Performance optimization
@Injectable()
export class CacheService {
    @Cacheable()
    async getExpensiveData() {
        // Results are cached
    }
}
```

**CQRS Pattern:**
```typescript
// Command Query Responsibility Segregation
@Controller('users')
export class UsersController {
    @Post()
    async create(@Body() dto: CreateUserDto) {
        return this.commandBus.execute(new CreateUserCommand(dto));
    }
}
```

### Recommended Resources

**Official Documentation:**
- NestJS Docs: https://docs.nestjs.com
- TypeORM Docs: https://typeorm.io
- TypeScript Handbook: https://www.typescriptlang.org/docs/

**Advanced Learning:**
- NestJS GraphQL integration
- Microservices architecture
- Event-driven design
- Docker containerization
- Kubernetes deployment
- CI/CD pipelines

**Community:**
- NestJS Discord: https://discord.gg/nestjs
- Stack Overflow: [nestjs] tag
- GitHub Issues: github.com/nestjs/nest

---

## Interview Prep: Key Concepts

### Common NestJS Interview Questions

**1. What is Dependency Injection and why is it important?**
```typescript
// DI allows NestJS to provide dependencies automatically
constructor(private userService: UserService) {}
// Benefits: Testability, maintainability, loose coupling
```

**2. Explain the request lifecycle in NestJS**
```
Middleware → Guard → Interceptor (before) → Pipe → 
Handler → Interceptor (after) → Filter → Response
```

**3. What's the difference between @Injectable and @Controller?**
- `@Injectable()`: Marks a class as a provider (can be injected)
- `@Controller()`: Marks a class as a request handler (defines routes)

**4. How do you handle authentication in NestJS?**
```typescript
// Combination of: Sessions + Guards + Decorators
@UseGuards(AuthGuard)
whoAmI(@CurrentUser() user: User) {}
```

**5. What are DTOs and why use them?**
- Define data structure for requests/responses
- Enable validation with class-validator
- Provide type safety

**6. Explain decorators you've used**
```typescript
@Controller()    // Define controller and routes
@Injectable()    // Make class injectable
@Get/@Post()     // HTTP methods
@Body/@Param()   // Extract request data
@UseGuards()     // Apply guards
@Serialize()     // Custom decorator for response transformation
```

**7. How do you test NestJS applications?**
- Unit tests: Test services in isolation with mocked dependencies
- Integration tests: Test modules working together
- E2E tests: Test full application flow

**8. What's the difference between Interceptors and Middleware?**
- Middleware: Executes before request reaches NestJS pipeline
- Interceptors: Part of NestJS pipeline, access execution context

---

## Code Examples Cheat Sheet

### Quick Reference

**Creating a Complete Resource:**
```bash
# Generate everything at once
nest g resource users

# Or individually
nest g module users
nest g controller users
nest g service users
```

**Basic CRUD Controller:**
```typescript
@Controller('items')
export class ItemsController {
    @Get()              // GET /items
    findAll() {}
    
    @Get(':id')         // GET /items/:id
    findOne(@Param('id') id: string) {}
    
    @Post()             // POST /items
    create(@Body() dto: CreateItemDto) {}
    
    @Patch(':id')       // PATCH /items/:id
    update(@Param('id') id: string, @Body() dto: UpdateItemDto) {}
    
    @Delete(':id')      // DELETE /items/:id
    remove(@Param('id') id: string) {}
}
```

**Service with Repository:**
```typescript
@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(Item)
        private repo: Repository<Item>,
    ) {}
    
    async findAll() {
        return await this.repo.find();
    }
    
    async findOne(id: number) {
        return await this.repo.findOne({ where: { id } });
    }
    
    async create(dto: CreateItemDto) {
        const item = this.repo.create(dto);
        return await this.repo.save(item);
    }
    
    async update(id: number, dto: UpdateItemDto) {
        const item = await this.findOne(id);
        Object.assign(item, dto);
        return await this.repo.save(item);
    }
    
    async remove(id: number) {
        const item = await this.findOne(id);
        return await this.repo.remove(item);
    }
}
```

**Entity with Relations:**
```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
    
    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];
}

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;
    
    @ManyToOne(() => User, (user) => user.posts)
    user: User;
}
```

**Authentication Flow:**
```typescript
// 1. Hash password
const hashed = await hashPassword(password);

// 2. Create user
const user = await this.userService.create({ email, password: hashed });

// 3. Store in session
session.userId = user.id;

// 4. Retrieve in middleware
const user = await this.userService.findOne(session.userId);
request.currentUser = user;

// 5. Access via decorator
@Get('/profile')
@UseGuards(AuthGuard)
getProfile(@CurrentUser() user: User) {
    return user;
}
```

---

## Final Tips

### Writing Clean NestJS Code

**1. Keep Controllers Thin:**
```typescript
// ❌ Bad - Business logic in controller
@Post()
async create(@Body() dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    const user = { ...dto, password: hash };
    return await this.repo.save(user);
}

// ✅ Good - Delegate to service
@Post()
async create(@Body() dto: CreateUserDto) {
    return await this.authService.signup(dto);
}
```

**2. Use DTOs Everywhere:**
```typescript
// Request DTOs for validation
export class CreateUserDto {
    @IsEmail() email: string;
    @MinLength(6) password: string;
}

// Response DTOs for serialization
export class UserDto {
    @Expose() id: number;
    @Expose() email: string;
    // password excluded
}
```

**3. Handle Errors Properly:**
```typescript
async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    
    if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
    }
    
    return user;
}
```

**4. Write Tests:**
```typescript
describe('AuthService', () => {
    it('creates user with hashed password', async () => {
        const user = await service.signup({ email, password });
        expect(user.password).not.toEqual(password);
    });
});
```

**5. Use Environment Variables:**
```typescript
// ❌ Never hardcode
const secret = 'my-secret-key';

// ✅ Use config
const secret = this.configService.get('SECRET_KEY');
```

---

## Project Structure Reference

```
src/
├── common/                      # Shared code
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── serialize.decorator.ts
│   ├── dtos/
│   │   ├── api-response.dto.ts
│   │   ├── meta.dto.ts
│   │   └── session.dto.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── admin.guard.ts
│   ├── interceptors/
│   │   ├── current-user.interceptor.ts
│   │   └── serialize.interceptor.ts
│   ├── middlewares/
│   │   └── current-user.middleware.ts
│   └── utils/
│       └── hash.util.ts
│
├── modules/                     # Feature modules
│   ├── users/
│   │   ├── dtos/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   ├── user.dto.ts
│   │   │   └── signin-user.dto.ts
│   │   ├── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.controller.spec.ts
│   │   ├── users.service.ts
│   │   ├── users.service.spec.ts
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts
│   │   └── users.module.ts
│   │
│   └── reports/
│       ├── dto/
│       │   ├── create-report.dto.ts
│       │   ├── approve-report.dto.ts
│       │   ├── get-estimate.dto.ts
│       │   └── report.dto.ts
│       ├── report.entity.ts
│       ├── reports.controller.ts
│       ├── reports.controller.spec.ts
│       ├── reports.service.ts
│       ├── reports.service.spec.ts
│       └── reports.module.ts
│
├── migrations/                  # Database migrations
│   └── 1762448516932-initial-schema.ts
│
├── app.controller.ts           # Root controller
├── app.service.ts              # Root service
├── app.module.ts               # Root module
├── main.ts                     # Application entry point
└── data-source.ts              # TypeORM configuration

test/                           # E2E tests
├── auth.e2e-spec.ts
├── app.e2e-spec.ts
├── jest-e2e.json
└── setup.ts

.env.development                # Development config
.env.test                       # Test config
.env.production                 # Production config
```

---

## Congratulations! 🎊

You've completed the NestJS Complete Developer's Guide and built production-ready applications!

### You Can Now:
✅ Build full-stack TypeScript applications  
✅ Design scalable REST APIs  
✅ Implement authentication and authorization  
✅ Work with databases using TypeORM  
✅ Write comprehensive tests  
✅ Deploy production-ready applications  
✅ Follow industry best practices  

### Share Your Success:
- Update your LinkedIn with "NestJS Developer"
- Add projects to your GitHub portfolio
- Build and deploy your own APIs
- Contribute to open-source NestJS projects

### Keep Learning:
- Build more complex projects
- Explore microservices architecture
- Learn GraphQL with NestJS
- Study system design patterns
- Join the NestJS community

**Happy Coding! 🚀**

---

**Created by**: Your Learning Journey  
**Course**: NestJS: The Complete Developer's Guide (Udemy)  
**Status**: ✅ COMPLETED  
**Last Updated**: November 2025  
**Your Achievement**: Full-Stack NestJS Developer 🏆