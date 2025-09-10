import { FastifyReply as BaseFastifyReply } from 'fastify';

declare global {
	namespace FastifyCookieNamespace {
		interface CookieSerializeOptions {
			domain?: string;
			expires?: Date;
			httpOnly?: boolean;
			maxAge?: number;
			partitioned?: boolean;
			path?: string;
			sameSite?: 'lax' | 'none' | 'strict' | boolean;
			priority?: 'low' | 'medium' | 'high';
			secure?: boolean | 'auto';
			signed?: boolean;
		}
	}
}

declare module 'fastify' {
	interface FastifyReply extends BaseFastifyReply {
		setCookie(
			name: string,
			value: string,
			options?: FastifyCookieNamespace.CookieSerializeOptions,
		): this;

		cookie(
			name: string,
			value: string,
			options?: FastifyCookieNamespace.CookieSerializeOptions,
		): this;

		clearCookie(
			name: string,
			options?: FastifyCookieNamespace.CookieSerializeOptions,
		): this;

		signCookie(value: string): string;

		unsignCookie(value: string): {
			valid: boolean;
			renew: boolean;
			value: string | null;
		};
	}

	interface FastifyRequest {
		cookies: { [cookieName: string]: string | undefined };
	}
}

export {};
