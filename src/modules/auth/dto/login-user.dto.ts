import { loginSchema } from '../../../drizzle/schema/users.schema';
import { createZodDto } from 'nestjs-zod';

export class LoginUserDto extends createZodDto(loginSchema) {}
