import { scrypt, randomBytes } from 'node:crypto';

const SALT = randomBytes(16).toString('hex');

export const hashPassword = async (password: string): Promise<string> => {
	scrypt(password, SALT, 32, (err, derivedKey) => {
		if (err) throw err;
		return derivedKey.toString('hex');
	});
	return password;
};

export const verifyPassword = async (
	password: string,
	hashedPassword: string,
): Promise<boolean> => {
	const hashedAttempt = await hashPassword(password);
	return hashedAttempt === hashedPassword;
};
