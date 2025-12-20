import { MAX_IMAGE_MB } from '../env';
import dns from 'dns';

// Middleware to validate form data
export function validateFormData(req, res, next) {
	// Check if the file field is empty
	if (!(req.file || req.files)) {
		return res.status(400).json({ error: 'File field is empty' });
	}
	// If the file field is not empty, continue to the next middleware or route handler
	next();
}

// Middleware to handle file size errors
export function handleMulterError(err, req, res, next) {
	if (err.code === 'LIMIT_FILE_SIZE') {
		return res
			.status(400)
			.json({ message: `File size too large. Maximum file size is ${MAX_IMAGE_MB}MB.` });
	}
	// Handle other multer errors or pass them along
	if (err) {
		return res.status(500).json({ message: 'An error occurred while uploading the file.' });
	}
	next();
}

/**
 * The function `checkInternet` returns a Promise that resolves to a boolean indicating whether the
 * internet connection is available.
 * @returns A Promise that resolves to a boolean value indicating whether there is an active internet
 * connection or not.
 */
function checkInternet(): Promise<boolean> {
	return new Promise((resolve) => {
		dns.lookup('google.com', (err) => {
			resolve(!err);
		});
	});
}

// Middleware to check internet connectivity before handling requests
export async function checkConnection(req, res, next) {
	const isConnected = await checkInternet();
	if (!isConnected) {
		return res.status(503).json({ error: 'No internet connection. Please check your network.' });
	}
	next();
}
