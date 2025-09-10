import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';

describe('AuthController', () => {
	let authController: AuthController;
	let authService: AuthService;
	let jwtService: JwtService;
	let configService: ConfigService;

	const mockConfigService = {
		getOrThrow: jest.fn((key: string) => {
			const config = {
				JWT_EXPIRATION_ACCESS_MS: '900000', // 15 minutes
				JWT_EXPIRATION_REFRESH_MS: '604800000', // 7 days
				JWT_EXPIRATION_ACCESS: '900000',
				PRIVATE_KEY: 'mock-private-key',
				REFRESH_TOKEN_SECRET: 'mock-refresh-secret',
				NODE_ENV: 'test',
			};
			return config[key];
		}),
		get: jest.fn((key: string) => {
			const config = {
				JWT_EXPIRATION_ACCESS: '900000',
				JWT_EXPIRATION_REFRESH_MS: '604800000',
				PRIVATE_KEY: 'mock-private-key',
				REFRESH_TOKEN_SECRET: 'mock-refresh-secret',
				NODE_ENV: 'test',
			};
			return config[key];
		}),
	};

	const mockJwtService = {
		sign: jest.fn(() => 'mock-jwt-token'),
	};

	const mockUsersService = {
		findOneByEmail: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				AuthService,
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
			],
		}).compile();

		authController = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
		jwtService = module.get<JwtService>(JwtService);
		configService = module.get<ConfigService>(ConfigService);
	});

	it('should be defined', () => {
		expect(authController).toBeDefined();
	});

	const user = {
		userId: '9999',
		username: 'nikola',
		password: 'changeme',
		email: 'nikola.changeme@mail.com',
		createdAt: new Date(),
		updatedAt: new Date(),
	} as User;

	describe('POST /login', () => {
		it('Should login successfully and set cookies correctly', async () => {
			const mockReply = {
				code: jest.fn().mockReturnThis(),
				send: jest.fn().mockReturnThis(),
				header: jest.fn().mockReturnThis(),
				type: jest.fn().mockReturnThis(),
				setCookie: jest.fn().mockReturnThis(),
				redirect: jest.fn().mockReturnThis(),
			} as unknown as FastifyReply;

			await authController.login(user, mockReply);

			expect(jwtService.sign).toHaveBeenCalledTimes(2);

			expect(jwtService.sign).toHaveBeenCalledWith(
				{ username: user.username, sub: user.userId },
				{
					expiresIn: '900000ms',
					algorithm: 'ES256',
					issuer: 'malina-corp',
					audience: 'malina-corp-users',
					privateKey: 'mock-private-key',
				},
			);

			expect(jwtService.sign).toHaveBeenCalledWith(
				{ username: user.username, sub: user.userId },
				{
					expiresIn: '604800000ms',
					algorithm: 'HS256',
					issuer: 'malina-corp',
					audience: 'malina-corp-users',
					secret: 'mock-refresh-secret',
				},
			);

			expect(mockReply.setCookie).toHaveBeenCalledTimes(2);

			expect(mockReply.setCookie).toHaveBeenCalledWith(
				'Authentification',
				'mock-jwt-token',
				{
					httpOnly: true,
					secure: false,
					expires: expect.any(Date),
				},
			);

			expect(mockReply.setCookie).toHaveBeenCalledWith(
				'Refresh',
				'mock-jwt-token',
				{
					httpOnly: true,
					secure: false,
					expires: expect.any(Date),
				},
			);

			expect(mockReply.redirect).not.toHaveBeenCalled();
		});
	});
});
