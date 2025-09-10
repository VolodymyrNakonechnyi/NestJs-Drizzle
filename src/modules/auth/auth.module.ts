import { Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
	imports: [JwtModule, ConfigModule, PassportModule],
	controllers: [AuthController],
	providers: [UsersService, AuthService, LocalStrategy],
})
export class AuthModule {}
