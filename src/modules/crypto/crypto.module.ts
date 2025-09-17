import { Module } from '@nestjs/common';
import { KeysService } from './services/keys.service';

@Module({
	controllers: [],
	providers: [KeysService],
	exports: [KeysService],
})
export class CryptoModule {}
