import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/modules/users/users.service';
import { TokenPayload } from '../token-payload.interface';
import { FastifyRequest } from 'fastify';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly usersService: UsersService,
		config: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: FastifyRequest) =>
					request.cookies?.Authenfication as string,
			]),
			secretOrKey: config.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
		});
	}

	validate(payload: TokenPayload) {
		return this.usersService.getUserById(payload.sub);
	}
}
