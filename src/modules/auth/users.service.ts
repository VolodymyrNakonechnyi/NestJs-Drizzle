import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User } from '../../drizzle/schema/users.schema';
import { UUID } from 'crypto';
import { HashingService } from '../../shared/crypto/services/hashing.service';

@Injectable()
export class UsersService {
	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly hashingService: HashingService,
	) {}

	async updateUser(userId: UUID, updateData: Partial<User>): Promise<User> {
		const existingUser = await this.usersRepository.findById(userId);
		if (!existingUser) {
			throw new NotFoundException('User not found');
		}

		return this.usersRepository.update(userId, updateData);
	}

	async deleteUser(userId: UUID): Promise<void> {
		const existingUser = await this.usersRepository.findById(userId);
		if (!existingUser) {
			throw new NotFoundException('User not found');
		}

		await this.usersRepository.delete(userId);
	}

	async verifyUserEmail(userId: UUID): Promise<User> {
		const existingUser = await this.usersRepository.findById(userId);
		if (!existingUser) {
			throw new NotFoundException('User not found');
		}

		return this.usersRepository.verifyEmail(userId);
	}

	async verifyUserPhone(userId: UUID): Promise<User> {
		const existingUser = await this.usersRepository.findById(userId);
		if (!existingUser) {
			throw new NotFoundException('User not found');
		}

		return this.usersRepository.verifyPhone(userId);
	}

	async changePassword(userId: UUID, newPassword: string): Promise<User> {
		const existingUser = await this.usersRepository.findById(userId);
		if (!existingUser) {
			throw new NotFoundException('User not found');
		}

		const hashedPassword = await this.hashingService.hash(newPassword);
		return this.usersRepository.setPassword(userId, hashedPassword);
	}
}
