import { userUpdateSchema } from '../../../drizzle/schema/users.schema';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserDto extends createZodDto(userUpdateSchema) {}
