import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PeopleRepository } from './people.repository';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { type Person } from 'src/modules/drizzle/schema/people.schema';
import {
	PersonNotFoundException,
	PersonAlreadyExistsException,
	PersonCreationFailedException,
	PersonUpdateFailedException,
	PersonDeletionFailedException,
} from './exceptions/people.exception';
import { NotFoundError } from 'rxjs';

@Injectable()
export class PeopleService {
	constructor(private readonly peopleRepository: PeopleRepository) {}

	async create(createPersonDto: CreatePersonDto): Promise<Person> {
		if (createPersonDto.phoneNumber) {
			const existingPerson =
				await this.peopleRepository.findByPhoneNumber(
					createPersonDto.phoneNumber,
				);
			if (existingPerson) {
				throw new PersonAlreadyExistsException(
					'phoneNumber',
					createPersonDto.phoneNumber,
				);
			}
		}

		const person = await this.peopleRepository.create(createPersonDto);

		if (!person) {
			throw new PersonCreationFailedException();
		}

		return person;
	}

	async findAll(): Promise<Person[] | undefined> {
		return this.peopleRepository.findAll();
	}

	async findOne(id: number): Promise<Person> {
		const person = await this.peopleRepository.findById(id);

		if (!person) {
			throw new PersonNotFoundException(id);
		}

		return person;
	}

	async update(
		id: number,
		updatePersonDto: UpdatePersonDto,
	): Promise<Person> {
		const existingPerson = await this.peopleRepository.findById(id);
		if (!existingPerson) {
			throw new PersonNotFoundException(id);
		}

		if (
			updatePersonDto.phoneNumber &&
			updatePersonDto.phoneNumber !== existingPerson.phoneNumber
		) {
			const phoneExists = await this.peopleRepository.findByPhoneNumber(
				updatePersonDto.phoneNumber,
			);
			if (phoneExists) {
				throw new PersonAlreadyExistsException(
					'phoneNumber',
					updatePersonDto.phoneNumber,
				);
			}
		}

		const updatedPerson = await this.peopleRepository.update(
			id,
			updatePersonDto,
		);

		if (!updatedPerson) {
			throw new PersonUpdateFailedException(id);
		}

		return updatedPerson;
	}

	async remove(id: number): Promise<Person> {
		const existingPerson = await this.peopleRepository.findById(id);
		if (!existingPerson) {
			throw new PersonNotFoundException(id);
		}

		const deletedPerson = await this.peopleRepository.delete(id);

		if (!deletedPerson) {
			throw new PersonDeletionFailedException(id);
		}

		return deletedPerson;
	}

	async findByPhone(phoneNumber: string): Promise<Person | null | undefined> {
		return this.peopleRepository.findByPhoneNumber(phoneNumber);
	}

	async exists(id: number): Promise<boolean | undefined> {
		return this.peopleRepository.exists(id);
	}
}
