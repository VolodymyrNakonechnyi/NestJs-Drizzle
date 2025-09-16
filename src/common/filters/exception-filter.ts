import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { STATUS_CODES } from 'http';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<FastifyReply>();
		const request = ctx.getRequest<FastifyRequest>();
		const status = exception.getStatus();

		response.status(status).send({
			statusCode: status,
			message:
				exception.message || STATUS_CODES[status] || 'Unexpected error',
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
