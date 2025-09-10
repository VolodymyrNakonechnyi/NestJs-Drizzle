import { userInsertSchema } from 'src/modules/drizzle/schema/users.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateUserDto extends createZodDto(userInsertSchema) {}
