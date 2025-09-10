import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { DrizzleDB } from '../drizzle/types/drizzle';
import { people } from '../drizzle/schema/people.schema';

describe('PeopleController', () => {
	let app: INestApplication;
	let db: DrizzleDB;
	let createdPersonId: number;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe());

		db = moduleFixture.get<DrizzleDB>(DRIZZLE);

		await app.init();
	});

	beforeEach(async () => {
		await db.delete(people);
	});

	afterAll(async () => {
		await db.delete(people);
		await app.close();
	});

	describe('POST /people', () => {
		it('should create a new person successfully', async () => {
			const createPersonDto = {
				fullName: 'John Doe',
				phoneNumber: '+1234567890',
				nickname: 'johnny',
			};

			const response = await request(app.getHttpServer())
				.post('/people')
				.send(createPersonDto)
				.expect(201);

			expect(response.body).toHaveProperty('id');
			expect(response.body.fullName).toBe(createPersonDto.fullName);
			expect(response.body.phoneNumber).toBe(createPersonDto.phoneNumber);
			expect(response.body.nickname).toBe(createPersonDto.nickname);
			expect(response.body).toHaveProperty('registrationDate');

			createdPersonId = response.body.id;
		});

		it('should create a person without phone number and nickname', async () => {
			const createPersonDto = {
				fullName: 'Jane Smith',
			};

			const response = await request(app.getHttpServer())
				.post('/people')
				.send(createPersonDto)
				.expect(201);

			expect(response.body).toHaveProperty('id');
			expect(response.body.fullName).toBe(createPersonDto.fullName);
			expect(response.body.phoneNumber).toBeNull();
			expect(response.body.nickname).toBeNull();
			expect(response.body).toHaveProperty('registrationDate');
		});

		it('should create a person with only nickname', async () => {
			const createPersonDto = {
				fullName: 'Alice Johnson',
				nickname: 'alice',
			};

			const response = await request(app.getHttpServer())
				.post('/people')
				.send(createPersonDto)
				.expect(201);

			expect(response.body).toHaveProperty('id');
			expect(response.body.fullName).toBe(createPersonDto.fullName);
			expect(response.body.nickname).toBe(createPersonDto.nickname);
			expect(response.body.phoneNumber).toBeNull();
			expect(response.body).toHaveProperty('registrationDate');
		});

		it('should return 409 when creating person with duplicate phone number', async () => {
			const createPersonDto = {
				fullName: 'John Doe',
				phoneNumber: '+1234567890',
				nickname: 'johnny',
			};

			await request(app.getHttpServer())
				.post('/people')
				.send(createPersonDto)
				.expect(201);

			const duplicatePersonDto = {
				fullName: 'Jane Smith',
				phoneNumber: '+1234567890',
				nickname: 'jane',
			};

			await request(app.getHttpServer())
				.post('/people')
				.send(duplicatePersonDto)
				.expect(409);
		});

		it('should return 400 for invalid data', async () => {
			const invalidPersonDto = {
				// Missing required fullName
				nickname: 'invalid',
				phoneNumber: '+1234567890',
			};

			await request(app.getHttpServer())
				.post('/people')
				.send(invalidPersonDto)
				.expect(400);
		});

		it('should return 400 for fullName exceeding length limit', async () => {
			const invalidPersonDto = {
				fullName: 'A'.repeat(256), // Exceeds 255 character limit
				nickname: 'test',
			};

			await request(app.getHttpServer())
				.post('/people')
				.send(invalidPersonDto)
				.expect(400);
		});

		it('should return 400 for nickname exceeding length limit', async () => {
			const invalidPersonDto = {
				fullName: 'John Doe',
				nickname: 'A'.repeat(101), // Exceeds 100 character limit
			};

			await request(app.getHttpServer())
				.post('/people')
				.send(invalidPersonDto)
				.expect(400);
		});

		it('should return 400 for phoneNumber exceeding length limit', async () => {
			const invalidPersonDto = {
				fullName: 'John Doe',
				phoneNumber: '+' + '1'.repeat(20), // Exceeds 20 character limit
			};

			await request(app.getHttpServer())
				.post('/people')
				.send(invalidPersonDto)
				.expect(400);
		});
	});

	describe('GET /people', () => {
		beforeEach(async () => {
			// Create test data
			const testPeople = [
				{
					fullName: 'John Doe',
					phoneNumber: '+1234567890',
					nickname: 'johnny',
				},
				{
					fullName: 'Jane Smith',
					phoneNumber: '+0987654321',
					nickname: 'jane',
				},
				{
					fullName: 'Bob Wilson',
				},
			];

			for (const person of testPeople) {
				await request(app.getHttpServer()).post('/people').send(person);
			}
		});

		it('should return all people', async () => {
			const response = await request(app.getHttpServer())
				.get('/people')
				.expect(200);

			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(3);
			expect(response.body[0]).toHaveProperty('id');
			expect(response.body[0]).toHaveProperty('fullName');
			expect(response.body[0]).toHaveProperty('registrationDate');
		});

		it('should return empty array when no people exist', async () => {
			// Clean up first
			await db.delete(people);

			const response = await request(app.getHttpServer())
				.get('/people')
				.expect(200);

			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(0);
		});
	});

	describe('GET /people/:id', () => {
		beforeEach(async () => {
			const createPersonDto = {
				fullName: 'John Doe',
				phoneNumber: '+1234567890',
				nickname: 'johnny',
			};

			const response = await request(app.getHttpServer())
				.post('/people')
				.send(createPersonDto);

			createdPersonId = response.body.id;
		});

		it('should return a person by id', async () => {
			const response = await request(app.getHttpServer())
				.get(`/people/${createdPersonId}`)
				.expect(200);

			expect(response.body.id).toBe(createdPersonId);
			expect(response.body.fullName).toBe('John Doe');
			expect(response.body.phoneNumber).toBe('+1234567890');
			expect(response.body.nickname).toBe('johnny');
			expect(response.body).toHaveProperty('registrationDate');
		});

		it('should return 404 for non-existent person', async () => {
			const nonExistentId = 99999;

			await request(app.getHttpServer())
				.get(`/people/${nonExistentId}`)
				.expect(404);
		});

		it('should return 400 for invalid id format', async () => {
			await request(app.getHttpServer())
				.get('/people/invalid-id')
				.expect(400);
		});
	});

	describe('PATCH /people/:id', () => {
		beforeEach(async () => {
			const createPersonDto = {
				fullName: 'John Doe',
				phoneNumber: '+1234567890',
				nickname: 'johnny',
			};

			const response = await request(app.getHttpServer())
				.post('/people')
				.send(createPersonDto);

			createdPersonId = response.body.id;
		});

		it('should update a person successfully', async () => {
			const updatePersonDto = {
				fullName: 'Johnny Doe',
				nickname: 'johnnyd',
			};

			const response = await request(app.getHttpServer())
				.patch(`/people/${createdPersonId}`)
				.send(updatePersonDto)
				.expect(200);

			expect(response.body.id).toBe(createdPersonId);
			expect(response.body.fullName).toBe('Johnny Doe');
			expect(response.body.nickname).toBe('johnnyd');
			expect(response.body.phoneNumber).toBe('+1234567890'); // Unchanged
		});

		it('should update only phone number', async () => {
			const updatePersonDto = {
				phoneNumber: '+9876543210',
			};

			const response = await request(app.getHttpServer())
				.patch(`/people/${createdPersonId}`)
				.send(updatePersonDto)
				.expect(200);

			expect(response.body.id).toBe(createdPersonId);
			expect(response.body.fullName).toBe('John Doe'); // Unchanged
			expect(response.body.nickname).toBe('johnny'); // Unchanged
			expect(response.body.phoneNumber).toBe('+9876543210');
		});

		it('should clear phone number and nickname', async () => {
			const updatePersonDto = {
				phoneNumber: null,
				nickname: null,
			};

			const response = await request(app.getHttpServer())
				.patch(`/people/${createdPersonId}`)
				.send(updatePersonDto)
				.expect(200);

			expect(response.body.id).toBe(createdPersonId);
			expect(response.body.fullName).toBe('John Doe'); // Unchanged
			expect(response.body.phoneNumber).toBeNull();
			expect(response.body.nickname).toBeNull();
		});

		it('should return 404 for non-existent person', async () => {
			const nonExistentId = 99999;
			const updatePersonDto = {
				fullName: 'Johnny Doe',
			};

			await request(app.getHttpServer())
				.patch(`/people/${nonExistentId}`)
				.send(updatePersonDto)
				.expect(404);
		});

		it('should return 409 when updating to duplicate phone number', async () => {
			const anotherPersonDto = {
				fullName: 'Jane Smith',
				phoneNumber: '+0987654321',
				nickname: 'jane',
			};

			await request(app.getHttpServer())
				.post('/people')
				.send(anotherPersonDto);

			const updatePersonDto = {
				phoneNumber: '+0987654321',
			};

			await request(app.getHttpServer())
				.patch(`/people/${createdPersonId}`)
				.send(updatePersonDto)
				.expect(409);
		});

		it('should allow updating with same phone number', async () => {
			const updatePersonDto = {
				fullName: 'Johnny Doe',
				phoneNumber: '+1234567890', // Same phone number
			};

			const response = await request(app.getHttpServer())
				.patch(`/people/${createdPersonId}`)
				.send(updatePersonDto)
				.expect(200);

			expect(response.body.fullName).toBe('Johnny Doe');
			expect(response.body.phoneNumber).toBe('+1234567890');
		});

		it('should return 400 for invalid update data', async () => {
			const updatePersonDto = {
				fullName: 'A'.repeat(256), // Exceeds length limit
			};

			await request(app.getHttpServer())
				.patch(`/people/${createdPersonId}`)
				.send(updatePersonDto)
				.expect(400);
		});

		it('should return 400 for invalid id format', async () => {
			const updatePersonDto = {
				fullName: 'Johnny Doe',
			};

			await request(app.getHttpServer())
				.patch('/people/invalid-id')
				.send(updatePersonDto)
				.expect(400);
		});
	});

	describe('DELETE /people/:id', () => {
		beforeEach(async () => {
			const createPersonDto = {
				fullName: 'John Doe',
				phoneNumber: '+1234567890',
				nickname: 'johnny',
			};

			const response = await request(app.getHttpServer())
				.post('/people')
				.send(createPersonDto);

			createdPersonId = response.body.id;
		});

		it('should delete a person successfully', async () => {
			await request(app.getHttpServer())
				.delete(`/people/${createdPersonId}`)
				.expect(204);

			// Verify person is deleted
			await request(app.getHttpServer())
				.get(`/people/${createdPersonId}`)
				.expect(404);
		});

		it('should return 404 for non-existent person', async () => {
			const nonExistentId = 99999;

			await request(app.getHttpServer())
				.delete(`/people/${nonExistentId}`)
				.expect(404);
		});

		it('should return 400 for invalid id format', async () => {
			await request(app.getHttpServer())
				.delete('/people/invalid-id')
				.expect(400);
		});
	});

	describe('Complex scenarios', () => {
		it('should handle full CRUD lifecycle', async () => {
			const createPersonDto = {
				fullName: 'John Doe',
				phoneNumber: '+1234567890',
				nickname: 'johnny',
			};

			// Create
			const createResponse = await request(app.getHttpServer())
				.post('/people')
				.send(createPersonDto)
				.expect(201);

			const personId = createResponse.body.id;

			// Read
			await request(app.getHttpServer())
				.get(`/people/${personId}`)
				.expect(200);

			// Update
			const updatePersonDto = {
				fullName: 'Johnny Doe',
				nickname: 'johnnyd',
			};

			await request(app.getHttpServer())
				.patch(`/people/${personId}`)
				.send(updatePersonDto)
				.expect(200);

			// Delete
			await request(app.getHttpServer())
				.delete(`/people/${personId}`)
				.expect(204);

			// Verify deletion
			await request(app.getHttpServer())
				.get(`/people/${personId}`)
				.expect(404);
		});

		it('should handle concurrent operations safely', async () => {
			const phoneNumber = '+1234567890';

			// Try to create multiple people with same phone number concurrently
			const promises = Array.from({ length: 5 }, (_, i) =>
				request(app.getHttpServer())
					.post('/people')
					.send({
						fullName: `Person ${i} Test`,
						phoneNumber,
						nickname: `person${i}`,
					}),
			);

			const results = await Promise.allSettled(promises);

			// Only one should succeed (201), others should fail (409)
			const successes = results.filter(
				(r) => r.status === 'fulfilled' && r.value.status === 201,
			);
			const conflicts = results.filter(
				(r) => r.status === 'fulfilled' && r.value.status === 409,
			);

			expect(successes.length).toBe(1);
			expect(conflicts.length).toBe(4);
		});

		it('should validate data integrity after operations', async () => {
			const createPersonDto = {
				fullName: 'John Doe',
				phoneNumber: '+1234567890',
				nickname: 'johnny',
			};

			// Create person
			const createResponse = await request(app.getHttpServer())
				.post('/people')
				.send(createPersonDto);

			const personId = createResponse.body.id;

			// Update person
			const updatePersonDto = {
				fullName: 'Johnny Doe',
				phoneNumber: '+0987654321',
			};

			await request(app.getHttpServer())
				.patch(`/people/${personId}`)
				.send(updatePersonDto);

			// Verify all data is correctly updated
			const getResponse = await request(app.getHttpServer()).get(
				`/people/${personId}`,
			);

			expect(getResponse.body.fullName).toBe('Johnny Doe');
			expect(getResponse.body.phoneNumber).toBe('+0987654321');
			expect(getResponse.body.nickname).toBe('johnny'); // Unchanged
			expect(getResponse.body).toHaveProperty('registrationDate');
		});

		it('should handle edge cases with registration date', async () => {
			const beforeTest = new Date();
			beforeTest.setHours(0, 0, 0, 0);

			const createPersonDto = {
				fullName: 'Test Person',
			};

			const response = await request(app.getHttpServer())
				.post('/people')
				.send(createPersonDto)
				.expect(201);

			expect(response.body).toHaveProperty('registrationDate');
			expect(typeof response.body.registrationDate).toBe('string');

			const registrationDate = new Date(response.body.registrationDate);
			const today = new Date();

			expect(registrationDate.getFullYear()).toBe(today.getFullYear());
			expect(registrationDate.getMonth()).toBe(today.getMonth());

			const dayDiff = Math.abs(
				registrationDate.getDate() - today.getDate(),
			);
			expect(dayDiff).toBeLessThanOrEqual(1);
		});

		it('should handle multiple people with same fullName but different other fields', async () => {
			const person1 = {
				fullName: 'John Doe',
				phoneNumber: '+1234567890',
				nickname: 'johnny1',
			};

			const person2 = {
				fullName: 'John Doe',
				phoneNumber: '+0987654321',
				nickname: 'johnny2',
			};

			const response1 = await request(app.getHttpServer())
				.post('/people')
				.send(person1)
				.expect(201);

			const response2 = await request(app.getHttpServer())
				.post('/people')
				.send(person2)
				.expect(201);

			expect(response1.body.id).not.toBe(response2.body.id);
			expect(response1.body.fullName).toBe(response2.body.fullName);
			expect(response1.body.phoneNumber).not.toBe(
				response2.body.phoneNumber,
			);
			expect(response1.body.nickname).not.toBe(response2.body.nickname);
		});
	});
});
