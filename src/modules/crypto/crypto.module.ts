import { Module } from '@nestjs/common';
import { KeysService } from './services/keys.service';
import { HashingService } from './services/hashing.service';

@Module({
	controllers: [],
	providers: [KeysService, HashingService],
	exports: [KeysService, HashingService],
})
export class CryptoModule {}
