export const appConfig = {
	name: process.env.NAME || 'Malina API',
	version: process.env.VERSION || 'v1.0.0',
	description: process.env.DESCRIPTION || 'Malina API',
	appUrl: process.env.APP_URL || 'http://localhost:8080',
	frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
