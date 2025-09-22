import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { CryptoModule } from '../../shared/crypto/crypto.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersRepository } from './users.repository';

@Module({
	imports: [JwtModule, ConfigModule, PassportModule, CryptoModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
		GoogleStrategy,
		JwtRefreshStrategy,
		UsersRepository,
	],
})
export class AuthModule {}
