import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { TokenPayload } from '../token-payload.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	constructor(
		configService: ConfigService,
		private readonly authService: AuthService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: FastifyRequest) => request.cookies?.Refresh as string,
			]),
			secretOrKey: configService.getOrThrow<string>(
				'REFRESH_TOKEN_SECRET',
			),
			passReqToCallback: true,
		});
	}

	async validate(request: FastifyRequest, payload: TokenPayload) {
		return this.authService.validateRefreshToken(
			payload.sub,
			request.cookies?.Refresh as string,
		);
	}
}
