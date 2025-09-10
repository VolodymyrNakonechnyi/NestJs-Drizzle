import { Injectable, NotFoundException } from '@nestjs/common';
import { email } from 'zod';
import { hashPassword } from '../../common/utils/hash.util';
import { CreateUserDto } from './dto/create-user.dto';

export type User = any;

@Injectable()
export class UsersService {
	private readonly users = [
		{
			userId: 1,
			username: 'john',
			password: 'changeme',
			email: 'john@mail.com',
		},
		{
			userId: 2,
			username: 'maria',
			password: 'guess',
			email: 'maria.mail.com',
		},
	];

	async createUser(createUser: CreateUserDto): Promise<User> {
		const newUser = {
			...createUser,
			userId: this.users.length + 1,
			password: await hashPassword(createUser.password),
		};

		this.users.push(newUser);
		return newUser;
	}

	async findOneByEmail(email: string): Promise<User | undefined> {
		const user = this.users.find((user) => user.email === email);

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return user;
	}

	async getUserById(id: string) {
		return this.users.find((user) => user.userId === +id);
	}
}
