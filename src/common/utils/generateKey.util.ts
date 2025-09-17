import * as crypto from 'node:crypto';
import { IKeys } from '../interfaces/keys.interface';
import { InternalServerErrorException } from '@nestjs/common';

export const generateKeysSync = (): IKeys => {
	try {
		const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
			namedCurve: 'prime256v1',
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem',
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem',
			},
		});
		return { publicKey, privateKey };
	} catch (error) {
		throw new InternalServerErrorException(
			`Error of keys generation: ${error.message}`,
		);
	}
};

export const generateKeys = async (): Promise<IKeys> => {
	return generateKeysSync();
};
