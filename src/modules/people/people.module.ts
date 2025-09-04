import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';
import { DrizzleModule } from 'src/modules/drizzle/drizzle.module';

@Module({
	imports: [DrizzleModule],
	controllers: [PeopleController],
	providers: [PeopleService],
})
export class PeopleModule {}
