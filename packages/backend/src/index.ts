import { config, DotenvConfigOutput } from 'dotenv';
try {
	const result: DotenvConfigOutput = config();
	if (result && result.parsed) {
		Object.keys(result.parsed).forEach((key) => {
			process.env[key] = result.parsed[key];
		});
	}
} catch (e) {
	console.info('.env file not found, skipping..');
}

import App from './App';
import { PORT } from './env';
new App(PORT).listen();
