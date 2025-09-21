import { type User } from '../../drizzle/schema/users.schema';

export interface PublicUserData {
	userId: string;
	username: string;
	email: string;
	firstName?: string;
	lastName?: string;
	avatar?: string;
	verifiedEmail: boolean;
	verifiedPhone: boolean;
	createdAt: string;
}

export function mapUserToPublic(user: User): PublicUserData {
	return {
		userId: user.userId,
		username: user.username,
		email: user.email,
		firstName: user.firstName as string,
		lastName: user.lastName as string,
		avatar: user.picture as string,
		verifiedEmail: user.verifiedEmail,
		verifiedPhone: user.verifiedPhone,
		createdAt: user.createdAt.toISOString(),
	};
}

export function UserMapper(): MethodDecorator {
	return function (
		target: any,
		propertyKey: string | symbol | undefined,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const result = await originalMethod.apply(this, args);

			if (result && typeof result === 'object') {
				if (result.userId) {
					return mapUserToPublic(result);
				}

				if (
					result.data &&
					result.data.user &&
					result.data.user.userId
				) {
					return {
						...result,
						data: {
							...result.data,
							user: mapUserToPublic(result.data.user),
						},
					};
				}

				if (Array.isArray(result) && result[0]?.userId) {
					return result.map(mapUserToPublic);
				}

				if (
					result.data &&
					Array.isArray(result.data) &&
					result.data[0]?.userId
				) {
					return {
						...result,
						data: result.data.map(mapUserToPublic),
					};
				}
			}

			return result;
		};

		return descriptor;
	};
}

export function MapResponseUser(): MethodDecorator {
	return function (
		target: any,
		propertyKey: string | symbol | undefined,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const result = await originalMethod.apply(this, args);

			if (result?.data?.user) {
				result.data.user = mapUserToPublic(result.data.user);
			}

			return result;
		};

		return descriptor;
	};
}

export function MapUserArray(): MethodDecorator {
	return function (
		target: any,
		propertyKey: string | symbol | undefined,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const result = await originalMethod.apply(this, args);

			if (Array.isArray(result)) {
				return result.map(mapUserToPublic);
			}

			if (result?.data && Array.isArray(result.data)) {
				result.data = result.data.map(mapUserToPublic);
			}

			return result;
		};

		return descriptor;
	};
}
