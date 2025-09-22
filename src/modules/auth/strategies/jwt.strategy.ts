import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { FastifyRequest } from 'fastify';
import { KeysService } from '../../../shared/crypto/services/keys.service';
import { UsersRepository } from '../users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		keysService: KeysService,
		private readonly usersRepository: UsersRepository,
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
		return this.usersRepository.findById(payload.sub);
	}
}
