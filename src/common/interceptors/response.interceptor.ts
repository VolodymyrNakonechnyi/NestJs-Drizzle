import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
	success: boolean;
	data: T;
	message: string;
	timestamp: string;
	statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<Response<T>> {
		const httpContext = context.switchToHttp();
		const response = httpContext.getResponse() as FastifyReply;

		return next.handle().pipe(
			map((data) => ({
				success: true,
				data: data?.data || data,
				message: data?.message || 'Request successful',
				timestamp: new Date().toISOString(),
				statusCode: response.statusCode,
			})),
		);
	}
}
