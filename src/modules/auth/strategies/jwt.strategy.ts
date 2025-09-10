import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/modules/users/users.service';
import { TokenPayload } from '../token-payload.interface';
import { FastifyRequest } from 'fastify';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private readonly usersService: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: FastifyRequest) =>
					request.cookies?.Authenfication as string,
			]),
			secretOrKey: configService.getOrThrow('PRIVATE_KEY'),
		});
	}

	validate(payload: TokenPayload) {
		return this.usersService.getUserById(payload.sub);
	}
}
