import { Module } from '@nestjs/common';
import { HarvestService } from './harvest.service';
import { HarvestController } from './harvest.controller';
import { HarvestRepository } from './harvest.repository';

@Module({
  providers: [HarvestService, HarvestRepository],
  controllers: [HarvestController],
})
export class HarvestModule {}
