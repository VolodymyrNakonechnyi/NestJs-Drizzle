import {
	NotFoundException,
	BadRequestException,
	ConflictException,
	InternalServerErrorException,
} from '@nestjs/common';

export class PersonNotFoundException extends NotFoundException {
	constructor(id: number) {
		super(`Person with ID ${id} not found`);
	}
}

export class PersonAlreadyExistsException extends ConflictException {
	constructor(field: string, value: string) {
		super(`Person with ${field} '${value}' already exists`);
	}
}

export class InvalidPersonIdException extends BadRequestException {
	constructor(id: any) {
		super(`Invalid person ID: ${id}. Must be a positive number`);
	}
}

export class PersonCreationFailedException extends InternalServerErrorException {
	constructor(reason?: string) {
		super(`Failed to create person${reason ? `: ${reason}` : ''}`);
	}
}

export class PersonUpdateFailedException extends InternalServerErrorException {
	constructor(id: number, reason?: string) {
		super(
			`Failed to update person with ID ${id}${reason ? `: ${reason}` : ''}`,
		);
	}
}

export class PersonDeletionFailedException extends InternalServerErrorException {
	constructor(id: number, reason?: string) {
		super(
			`Failed to delete person with ID ${id}${reason ? `: ${reason}` : ''}`,
		);
	}
}
