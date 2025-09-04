import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';
import { DrizzleModule } from '../../modules/drizzle/drizzle.module';
import { PeopleRepository } from './people.repository';

@Module({
	imports: [DrizzleModule],
	controllers: [PeopleController],
	providers: [PeopleService, PeopleRepository],
})
export class PeopleModule {}
