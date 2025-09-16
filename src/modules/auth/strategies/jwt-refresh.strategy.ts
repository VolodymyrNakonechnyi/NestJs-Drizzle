import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { TokenPayload } from '../token-payload.interface';

export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	constructor(
		private readonly authService: AuthService,
		configService: ConfigService,
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
			request.cookies?.Refresh as string,
			payload.sub,
		);
	}
}
