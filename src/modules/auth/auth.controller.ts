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
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current.user.decorator';
import { type User } from '../drizzle/schema/users.schema';
import { type FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	async register(
		@Body() createUserDto: CreateUserDto,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		const user = await this.authService.register(createUserDto);

		return {
			message: `User '${user.username}' registered successfully`,
			data: {
				user: {
					userId: user.userId,
					username: user.username,
					email: user.email,
				},
			},
		};
	}

	@Post('login')
	@UseGuards(LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	async login(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		await this.authService.login(user, reply);
	}

	@Post('refresh')
	@UseGuards(JwtRefreshAuthGuard)
	@HttpCode(HttpStatus.OK)
	async refresh(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		await this.authService.login(user, reply);
	}

	@Get('google')
	@UseGuards(GoogleAuthGuard)
	googleAuth() {}

	@Get('google/callback')
	@UseGuards(GoogleAuthGuard)
	async googleCallback(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		await this.authService.login(user, reply);
	}
}
