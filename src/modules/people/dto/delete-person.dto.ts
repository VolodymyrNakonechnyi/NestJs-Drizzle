import { createZodDto } from 'nestjs-zod';
import { personDeleteSchema } from 'src/modules/drizzle/schema/people.schema';

export class DeletePersonDto extends createZodDto(personDeleteSchema) {}
