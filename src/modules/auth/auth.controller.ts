import {
	Controller,
	Post,
	UseGuards,
	Res,
	Body,
	HttpCode,
	HttpStatus,
	Get,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBody,
	ApiBearerAuth,
	ApiUnauthorizedResponse,
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiOkResponse,
} from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current.user.decorator';
import { type User } from '../drizzle/schema/users.schema';
import { type FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MapResponseUser } from '../users/decorators/user-mapper.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Register new user' })
	@ApiCreatedResponse({ description: 'User successfully registered' })
	@ApiBadRequestResponse({ description: 'Invalid registration data' })
	@ApiOperation({
		summary: 'Register new user',
		description: 'Create a new user account and automatically log them in',
	})
	@ApiBody({
		type: CreateUserDto,
		description: 'User registration data',
	})
	@ApiCreatedResponse({
		description: 'User successfully registered and logged in',
		schema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					example: "User 'johndoe' registered successfully",
				},
				data: {
					type: 'object',
					properties: {
						user: {
							type: 'object',
							properties: {
								userId: { type: 'string', format: 'uuid' },
								username: { type: 'string' },
								email: { type: 'string', format: 'email' },
								firstName: { type: 'string', nullable: true },
								lastName: { type: 'string', nullable: true },
								picture: { type: 'string', nullable: true },
								phoneNumber: { type: 'string', nullable: true },
								verifiedEmail: { type: 'boolean' },
								verifiedPhone: { type: 'boolean' },
								createdAt: {
									type: 'string',
								},
							},
						},
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Invalid registration data - validation errors',
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: 400 },
				message: {
					oneOf: [
						{ type: 'string' },
						{ type: 'array', items: { type: 'string' } },
					],
					example: [
						'email must be a valid email',
						'password is too weak',
					],
				},
				error: { type: 'string', example: 'Bad Request' },
			},
		},
	})
	@MapResponseUser()
	async register(
		@Body() createUserDto: CreateUserDto,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		const user = await this.authService.register(createUserDto);
		await this.authService.login(user, reply);

		return {
			message: `User '${user.username}' registered successfully`,
			data: {
				user: user,
			},
		};
	}

	@Post('login')
	@UseGuards(LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login user' })
	@ApiOkResponse({
		description:
			'Login successful. Access and refresh tokens set in cookies',
	})
	@ApiUnauthorizedResponse({ description: 'Invalid credentials' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				email: {
					type: 'string',
					example: 'jon.doe@mail.com',
				},
				password: {
					type: 'string',
					example: 'password123',
				},
			},
			required: ['email', 'password'],
		},
	})
	@MapResponseUser()
	async login(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		await this.authService.login(user, reply);

		return {
			message: 'Login successful',
			data: {
				user: user,
			},
		};
	}

	@Post('refresh')
	@UseGuards(JwtRefreshAuthGuard)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Refresh access token',
		description:
			'Uses refresh token from cookies to generate new access token',
	})
	@ApiOkResponse({
		description: 'Tokens refreshed successfully. New tokens set in cookies',
	})
	@ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
	@MapResponseUser()
	async refresh(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		await this.authService.login(user, reply);

		return {
			message: 'Tokens refreshed successfully',
			data: {
				user: user,
			},
		};
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Logout user' })
	@ApiOkResponse({
		description: 'Logout successful. Tokens cleared from cookies',
	})
	async logout(@Res({ passthrough: true }) reply: FastifyReply) {
		reply.clearCookie('access_token');
		reply.clearCookie('refresh_token');

		return {
			message: 'Logout successful',
		};
	}

	@Get('google')
	@UseGuards(GoogleAuthGuard)
	@ApiOperation({
		summary: 'Redirect to Google OAuth',
		description: 'Redirects user to Google authorization page',
	})
	@ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
	googleAuth() {}

	@Get('google/callback')
	@UseGuards(GoogleAuthGuard)
	@ApiOperation({
		summary: 'Google OAuth callback',
		description: 'Handles Google response and sets tokens in cookies',
	})
	@ApiOkResponse({
		description: 'Google authentication successful. Tokens set in cookies',
	})
	@ApiUnauthorizedResponse({ description: 'Google authentication error' })
	@MapResponseUser()
	async googleCallback(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		await this.authService.login(user, reply);

		return {
			message: 'Google authentication successful',
			data: {
				user: user,
			},
		};
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get current user information',
		description: 'Returns authenticated user data',
	})
	@ApiOkResponse({ description: 'User information' })
	@ApiUnauthorizedResponse({ description: 'User not authenticated' })
	@MapResponseUser()
	async getMe(@CurrentUser() user: User) {
		return {
			message: 'User data retrieved successfully',
			data: {
				user: user,
			},
		};
	}
}
