import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleModule } from '../../modules/drizzle/drizzle.module';
import { UsersRepository } from './users.repository';

@Module({
	imports: [DrizzleModule],
	providers: [UsersService, UsersRepository],
	exports: [UsersService],
})
export class UsersModule {}
