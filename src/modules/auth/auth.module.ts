import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { ESService } from '../crypto/services/es.service';
import { UsersModule } from '../users/users.module';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
	imports: [
		JwtModule,
		ConfigModule,
		PassportModule,
		UsersModule,
		CryptoModule,
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
