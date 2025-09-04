import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HarvestModule } from './modules/harvest/harvest.module';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './modules/drizzle/drizzle.module';
import { PeopleModule } from './modules/people/people.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
	imports: [
		HarvestModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DrizzleModule,
		PeopleModule,
		AuthModule,
	],
	controllers: [AppController, AuthController],
	providers: [
		AppService,
		{
			provide: APP_PIPE,
			useClass: ZodValidationPipe,
		},
		AuthService,
	],
})
export class AppModule {}
