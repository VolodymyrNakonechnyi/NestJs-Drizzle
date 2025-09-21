import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/modules/drizzle/schema/schema.ts',
	out: './src/modules/drizzle/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
});
