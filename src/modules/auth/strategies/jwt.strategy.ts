import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/modules/users/users.service';
import { TokenPayload } from '../token-payload.interface';
import { FastifyRequest } from 'fastify';
import { KeysService } from '../../../shared/crypto/services/keys.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		keysService: KeysService,
		private readonly usersService: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: FastifyRequest) =>
					request.cookies?.Authentification as string,
			]),
			secretOrKey: keysService.getKeysSync().publicKey,
		});
	}

	validate(payload: TokenPayload) {
		return this.usersService.getUserById(payload.sub);
	}
}
