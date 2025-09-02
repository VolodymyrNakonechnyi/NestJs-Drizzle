import { createZodDto } from 'nestjs-zod';
import { personDeleteSchema } from 'src/drizzle/schema/people.schema';

export class DeletePersonDto extends createZodDto(personDeleteSchema) {}
