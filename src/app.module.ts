import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HarvestModule } from './harvest/harvest.module';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { PeopleModule } from './people/people.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';

@Module({
	imports: [
		HarvestModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DrizzleModule,
		PeopleModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_PIPE,
			useClass: ZodValidationPipe,
		},
	],
})
export class AppModule {}
