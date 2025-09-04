import { createZodDto } from 'nestjs-zod';
import { personIdSchema } from '../../drizzle/schema/people.schema';

export class IdPersonDto extends createZodDto(personIdSchema) {}
