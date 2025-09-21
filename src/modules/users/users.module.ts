import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleModule } from '../../drizzle/drizzle.module';
import { UsersRepository } from './users.repository';
import { CryptoModule } from '../../shared/crypto/crypto.module';

@Module({
	imports: [DrizzleModule, CryptoModule],
	providers: [UsersService, UsersRepository],
	exports: [UsersService],
})
export class UsersModule {}
