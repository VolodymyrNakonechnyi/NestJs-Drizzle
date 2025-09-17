import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { promisify } from 'node:util';
import { type IKeys } from '../interfaces/keys.interface';

@Injectable()
export class ESService {
	private generateKeyPairAsync = promisify(crypto.generateKeyPair);
	private KEYS: IKeys;
	async generateKeys(): Promise<IKeys> {
		try {
			const { publicKey, privateKey } = await this.generateKeyPairAsync(
				'ec',
				{
					namedCurve: 'prime256v1',
					publicKeyEncoding: {
						type: 'spki',
						format: 'pem',
					},
					privateKeyEncoding: {
						type: 'pkcs8',
						format: 'pem',
					},
				},
			);

			return { publicKey, privateKey };
		} catch (error) {
			throw new Error(`Помилка генерації ключів: ${error.message}`);
		}
	}
}
