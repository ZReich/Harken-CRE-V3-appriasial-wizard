import winston from 'winston';
import database from '../../config/db';
const Logger = database.logger;
import { format } from 'winston';
import TransportStream = require('winston-transport');

// Define custom Winston transport
class SequelizeTransport extends TransportStream {
	level: any;
	jsonFormatter: winston.Logform.Format;
	constructor(opts) {
		super(opts);
		this.level = opts.level || 'info';
		this.jsonFormatter = format.json(); // Using winston.format.json() for JSON formatting
	}
	log(info, callback) {
		const { level, message, location, meta } = info;
		const TEXT_LIMIT = 65500;

		// Apply JSON formatting to the log message
		const formattedInfo = this.jsonFormatter.transform(info, { level, message, location, meta });

		// Check if formattedInfo is an object and not a boolean
		if (formattedInfo && typeof formattedInfo === 'object') {
			// Stringify the meta object
			let serializedMeta = JSON.stringify(formattedInfo.meta);
			let message;
			if (typeof formattedInfo.message === 'object' && formattedInfo.message !== null) {
				message = JSON.stringify(formattedInfo.message);
			} else {
				message = formattedInfo.message;
			}
			// Truncate message if it exceeds TEXT_LIMIT
			if (typeof message === 'string' && message.length > TEXT_LIMIT) {
				message = message.substring(0, TEXT_LIMIT);
			}
			// Truncate serializedMeta if it exceeds TEXT_LIMIT
			if (typeof serializedMeta === 'string' && serializedMeta.length > TEXT_LIMIT) {
				serializedMeta = meta.substring(0, TEXT_LIMIT);
			}
			Logger.create(
				{
					level,
					message: message,
					meta: serializedMeta, // Assign the serialized meta
					location,
				},
				{ raw: true },
			) // Use raw: true option to bypass Sequelize's validation
				.then(() => callback())
				.catch(callback);
		} else {
			// Call the callback immediately if formattedInfo is not an object
			callback();
		}
	}
}

// Create Winston logger instance
const logger = winston.createLogger({
	transports: [
		new SequelizeTransport({ level: 'info' }), // Pass any options required by the custom transport
	],
});

export default logger;
