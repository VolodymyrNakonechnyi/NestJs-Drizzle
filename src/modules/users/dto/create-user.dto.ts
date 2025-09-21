import { userInsertSchema } from '../../../drizzle/schema/users.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateUserDto extends createZodDto(userInsertSchema) {}
