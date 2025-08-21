import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HarvestModule } from './harvest/harvest.module';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';

@Module({
	imports: [
		HarvestModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DrizzleModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
