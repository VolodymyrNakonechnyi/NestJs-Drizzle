import { personUpdateSchema } from '../../../modules/drizzle/schema/people.schema';
import { createZodDto } from 'nestjs-zod';

export class UpdatePersonDto extends createZodDto(personUpdateSchema) {}
