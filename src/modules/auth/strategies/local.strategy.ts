import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { PublicUser } from '../serializer/user.serializer';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
	constructor(private readonly authService: AuthService) {
		super({ usernameField: 'email', passwordField: 'password' });
	}

	async validate(email: string, password: string): Promise<PublicUser> {
		return this.authService.validateUser(email, password);
	}
}
