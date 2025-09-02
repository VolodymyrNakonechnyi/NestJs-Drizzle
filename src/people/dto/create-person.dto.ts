import { createZodDto } from 'nestjs-zod';
import { personInsertSchema } from 'src/drizzle/schema/people.schema';

export class CreatePersonDto extends createZodDto(personInsertSchema) {}
