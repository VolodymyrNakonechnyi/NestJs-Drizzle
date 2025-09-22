import { UUID } from 'crypto';

export interface TokenPayload {
	username: string;
	sub: UUID;
}
