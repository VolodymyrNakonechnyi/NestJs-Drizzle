import '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import type { FastifyCookieOptions } from '@fastify/cookie';

async function bootstrap() {
	const fastifyAdapter = new FastifyAdapter();

	fastifyAdapter.register(fastifyCookie, {
		secret: process.env.COOKIE_SECRET,
	} as FastifyCookieOptions);

	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		fastifyAdapter,
	);
	app.setGlobalPrefix('api/v1');
	app.enableCors();

	const config = new DocumentBuilder()
		.setTitle('Malina Corp example')
		.setDescription('API for Malina Corp')
		.setVersion('1.0')
		.build();
	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, documentFactory);
	await app.listen(
		process.env.PORT ? Number(process.env.PORT) : 3000,
		'0.0.0.0',
	);
}
bootstrap();
