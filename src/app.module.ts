import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HarvestModule } from './modules/harvest/harvest.module';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { PeopleModule } from './modules/people/people.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { CryptoModule } from './shared/crypto/crypto.module';
import { HttpExceptionFilter } from './common/filters/exception-filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RefreshTokenModule } from './shared/refresh-token/refresh-token/refresh-token.module';

@Module({
	imports: [
		HarvestModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DrizzleModule,
		PeopleModule,
		AuthModule,
		CryptoModule,
		RefreshTokenModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_PIPE,
			useClass: ZodValidationPipe,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseInterceptor,
		},
	],
})
export class AppModule {}
