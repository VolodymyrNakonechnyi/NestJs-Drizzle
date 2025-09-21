import { userIdSchema } from '../../../modules/drizzle/schema/users.schema';
import { createZodDto } from 'nestjs-zod';

export class IdUserDto extends createZodDto(userIdSchema) {}
