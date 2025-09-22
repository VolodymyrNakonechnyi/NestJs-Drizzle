import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { type CreateUserDto } from 'src/modules/auth/dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users.repository';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		configService: ConfigService,
		private readonly usersRepository: UsersRepository,
	) {
		super({
			clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
			clientSecret: configService.getOrThrow<string>(
				'GOOGLE_CLIENT_SECRET',
			),
			callbackURL: configService.getOrThrow<string>(
				'GOOGLE_AUTH_REDIRECT_URI',
			),
			scope: ['email', 'profile'],
		});
	}

	async validate(_accessToken: string, _refreshToken: string, profile: any) {
		const newUser = await this.usersRepository.create({
			username: profile.displayName,
			email: profile.emails[0].value,
			password: Math.random().toString(36).slice(-8),
		} as CreateUserDto);

		return newUser;
	}
}
