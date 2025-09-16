import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { hashPassword } from '../../common/utils/hash.util';
import { CreateUserDto } from './dto/create-user.dto';
import { Logger } from '@nestjs/common';

export type User = any;

@Injectable()
export class UsersService {
	private users = [
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

	private readonly logger = new Logger(UsersService.name);

	private readonly rand = Math.random();

	async createUser(createUser: CreateUserDto): Promise<User> {
		const existingUserByEmail = await this.findOneByEmail(createUser.email);
		if (existingUserByEmail) {
			throw new ConflictException('User with this email exists');
		}

		const existingUserByUsername = await this.findOneByUsername(
			createUser.username,
		);
		if (existingUserByUsername) {
			throw new ConflictException('User with this username exists');
		}

		this.logger.log(`Creating user: ${createUser.username}`);

		const newUser = {
			...createUser,
			userId: this.users.length + 1,
			password: await hashPassword(createUser.password),
		};

		this.users.push(newUser);
		this.logger.log(`UsersService instance ID: ${this.rand}`);
		this.logger.log(JSON.stringify(this.users));

		return newUser;
	}

	async findOneByEmail(email: string): Promise<User | undefined> {
		return this.users.find((user) => user.email === email);
	}

	async findOneByUsername(username: string): Promise<User | undefined> {
		return this.users.find((user) => user.username === username);
	}

	async getUsers() {
		this.logger.log(`UsersService instance ID: ${this.rand}`);

		return this.users;
	}

	async getUserById(id: string) {
		return this.users.find((user) => user.userId === +id);
	}
}
