import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// rewrite this file for fastify in nest js please do not forget to import fastify adapter
// also set global prefix to apis

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
