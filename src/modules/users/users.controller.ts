import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	// Dummy endpoint to test users service
	// Please remove it later
	@Get()
	@HttpCode(HttpStatus.OK)
	getUsers() {
		return this.usersService.getUsers();
	}
}
