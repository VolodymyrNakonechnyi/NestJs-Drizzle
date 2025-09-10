import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ESService } from './services/es.service';

@Module({
	providers: [CryptoService, ESService],
	exports: [ESService],
})
export class CryptoModule {}
