import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Authentication System (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    // Arrange
    const { name, email, password } = generateRandomUserData();
    return request(app.getHttpServer())
      .post('/users/register')
      .send({
        name,
        email,
        password,
      })
      .expect(201)
      .then((res) => {
        const response: SignupResponseDTO = res.body;
        expect(response.action).toBe('create User');
        expect(response.success).toBe(true);
        expect(response.message).toBe(
          `User ${name} with email ${email} has been created successfully`,
        );
        expect(response.meta.session.userId).toBe(1);
        if (!response.meta.session.userId) {
          expect(response.data.id).toBe(1);
          expect(response.data.name).toBe(name);
          expect(response.data.email).toBe(email);
          expect(response.data.createdAt).toBe('2025-11-05T13:19:44.000Z');
          expect(response.data.updatedAt).toBe('2025-11-05T13:19:44.000Z');
        }
      });
  });

  it('signup as a new user then get the currently logged in user', async () => {
    // Arrange
    const { name, email, password } = generateRandomUserData();

    // Act
    const signupResponse = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        name,
        email,
        password,
      })
      .expect(201);

    const cookie = signupResponse.get('Set-Cookie');

    // Assert
    const { body } = await request(app.getHttpServer())
      .get('/users/whoami')
      .set('Cookie', cookie ?? [])
      .expect(200);
    expect(body.action).toBe('whoAmI');
    expect(body.success).toBe(true);
    expect(body.message).toBe(`User ${name} with email ${email} is logged in`);
    expect(body.meta.affectedRows).toBe(1);
    expect(body.data.id).toBe(1);
    expect(body.data.name).toBe(name);
    expect(body.data.email).toBe(email);
  });
});

interface SignupResponseDTO {
  action: string;
  success: boolean;
  message: string;
  meta: Meta;
  data: Data;
}

interface Meta {
  affectedRows: number;
  session: {
    userId: number;
  };
}

interface Data {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

function generateRandomUserData() {
  const randomNumber = Math.floor(Math.random() * 1000000);
  return {
    name: `Zack River${randomNumber}`,
    email: `zackriver${randomNumber}@example.com`,
    password: '123456',
  };
}
