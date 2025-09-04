import { createZodDto } from 'nestjs-zod';
import { personInsertSchema } from '../../drizzle/schema/people.schema';

export class CreatePersonDto extends createZodDto(personInsertSchema) {}
