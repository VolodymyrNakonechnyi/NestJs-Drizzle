import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { type IKeys } from '../../../common/interfaces/keys.interface';
import { generateKeysSync } from '../../../common/utils/generateKey.util';

@Injectable()
export class KeysService {
	private keys: IKeys;

	constructor() {
		this.initializeKeys();
	}

	private initializeKeys(): void {
		if (this.keys) {
			return;
		}

		try {
			this.keys = generateKeysSync();
		} catch (error) {
			throw new InternalServerErrorException(
				`Error generating keys: ${error.message}`,
			);
		}
	}

	async getKeys(): Promise<IKeys> {
		return this.keys;
	}

	getKeysSync(): IKeys {
		if (!this.keys) {
			throw new InternalServerErrorException('Keys not initialized');
		}
		return this.keys;
	}
}
