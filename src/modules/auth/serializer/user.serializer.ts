import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
	userSelectSchema,
	type User,
} from '../../../drizzle/schema/users.schema';

export const publicUserSchema = userSelectSchema
	.omit({
		password: true,
		updatedAt: true,
		lastPasswordChange: true,
		verifiedEmail: true,
		verifiedPhone: true,
	})
	.transform((data) => ({
		...data,
		createdAt: data.createdAt.toISOString(),
	}));

export type PublicUser = z.infer<typeof publicUserSchema>;

export class PublicUserDto extends createZodDto(publicUserSchema) {}

export class UserSerializer {
	static serialize(user: User): PublicUser {
		return publicUserSchema.parse(user);
	}

	static serializeMany(users: User[]): PublicUser[] {
		return users.map((user) => this.serialize(user));
	}
}

export function SerializeUser() {
	return function (
		target: any,
		propertyKey: string | symbol | undefined,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const result = await originalMethod.apply(this, args);

			if (!result) return result;

			if (result.data?.user) {
				result.data.user = UserSerializer.serialize(result.data.user);
				return result;
			}

			if (result.userId) {
				return UserSerializer.serialize(result);
			}

			if (Array.isArray(result)) {
				return UserSerializer.serializeMany(result);
			}

			if (result.data?.users && Array.isArray(result.data.users)) {
				result.data.users = UserSerializer.serializeMany(
					result.data.users,
				);
				return result;
			}

			return result;
		};

		return descriptor;
	};
}
