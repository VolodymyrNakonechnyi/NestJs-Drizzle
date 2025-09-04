import { createZodDto } from 'nestjs-zod';
import { personInsertSchema } from 'src/modules/drizzle/schema/people.schema';

export class CreatePersonDto extends createZodDto(personInsertSchema) {}
