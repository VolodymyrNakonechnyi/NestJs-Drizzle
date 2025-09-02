import { type Person as PersonType } from 'src/drizzle/schema/people.schema';

export class Person {
	public readonly id: number;
	public readonly fullName: string;
	public readonly nickname?: string | null;
	public readonly phoneNumber?: string | null;
	public readonly registrationDate: Date | string;

	constructor(person: PersonType) {
		this.id = Number(person.id);
		this.fullName = person.fullName;
		this.nickname = person.nickname;
		this.phoneNumber = person.phoneNumber;
		this.registrationDate = new Date(person.registrationDate);
	}
}
