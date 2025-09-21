import { Injectable } from '@nestjs/common';
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

@Injectable()
export class HashingService {
	private readonly saltRounds = 16;
	private readonly keyLength = 64;
	private readonly scryptAsync = promisify(scrypt);

	async hash(data: string): Promise<string> {
		const salt = randomBytes(this.saltRounds);
		const derivedKey = (await this.scryptAsync(
			data,
			salt,
			this.keyLength,
		)) as Buffer;

		return `${salt.toString('base64')}:${derivedKey.toString('base64')}`;
	}

	async compare(data: string, hashedData: string): Promise<boolean> {
		const [saltBase64, hashBase64] = hashedData.split(':');
		const salt = Buffer.from(saltBase64, 'base64');
		const storedHash = Buffer.from(hashBase64, 'base64');

		const derivedKey = (await this.scryptAsync(
			data,
			salt,
			this.keyLength,
		)) as Buffer;

		return timingSafeEqual(storedHash, derivedKey);
	}
}
