import { Controller, Post, UseGuards, Res } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current.user.decorator';
import { type User } from '../drizzle/schema/users.schema';
import { type FastifyReply } from 'fastify';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@UseGuards(LocalAuthGuard)
	async login(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		await this.authService.login(user, reply);
	}
}
