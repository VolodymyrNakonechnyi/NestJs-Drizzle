import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../src/app.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from 'src/modules/auth/auth.controller';

describe('AuthController(e2e)', () => {
	let app: INestApplication<App>;
	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule, JwtModule],
			controllers: [AuthController],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	const mockUser = {
		userId: 1,
		username: 'john',
		password: 'changeme',
		email: 'john@mail.com',
	};

	describe('api/v1/auth/register (POST)', () => {
		it('it should create a new user', () => {
			return request(app.getHttpServer())
				.post('register')
				.expect(HttpStatus.CREATED);
		});

		it('it should not create a new user with existing email', async () => {});
	});

	describe('api/v1/auth/login (POST)', () => {
		it('it should log in user and return JWT Authentification & Refresh tokens ', async () => {});

		it('it should not log in user with and not return JWT token for unregister users', async () => {});
	});
});
