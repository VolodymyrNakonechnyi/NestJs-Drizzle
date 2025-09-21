import { personUpdateSchema } from '../../../drizzle/schema/people.schema';
import { createZodDto } from 'nestjs-zod';

export class UpdatePersonDto extends createZodDto(personUpdateSchema) {}
