import { Controller } from '@nestjs/common';

@Controller('users')
export class UsersController {
	getUsers() {
		return 'users';
	}
}
