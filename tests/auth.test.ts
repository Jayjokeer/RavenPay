import request from 'supertest';
import app from '../src/app';
import knex from '../src/db'; 
import { hashPassword } from '../src/utils/encryption';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await knex.migrate.latest(); 
  });

  afterAll(async () => {
    await knex('users').del();
    await knex.destroy();
  });

  describe('POST /sign-up', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-up')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'Pass@123',
          phone: '08012345678'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data.email', 'john@example.com');
    });

    it('should not allow duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-up')
        .send({
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'AnotherPass123',
          phone: '08087654321'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  describe('POST /login', () => {
    it('should login user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Pass@123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data'); // token
    });

    it('should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should return 404 if user not found', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'AnyPassword'
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/user not found/i);
    });
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app).get('/api/v1/auth');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Welcome to RavenPay' });
    });
  });
});
