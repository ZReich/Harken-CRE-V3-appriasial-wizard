import { IncomingHttpHeaders } from 'http'; // Import IncomingHttpHeaders type
import IUser from '../utils/interfaces/IUser';
import { JWT_SECRET } from '../env';
import jwt from 'jsonwebtoken';
import { Response, response } from 'express';
import StatusCodeEnum from '../utils/enums/StatusCodeEnum';
import SendResponse from '../utils/common/commonResponse';
import UserEnum from '../utils/enums/MessageEnum';
import TokenTypeEnum from '../utils/enums/TokenTypeEnum';

export const extractBearerToken = (headers: IncomingHttpHeaders): string | undefined => {
	let token;
	const rawAuthorization = headers.authorization;
	if (
		rawAuthorization &&
		typeof rawAuthorization === 'string' &&
		rawAuthorization.startsWith('Bearer ')
	) {
		token = rawAuthorization.split('Bearer ')[1];
	}
	return token;
};

// Define type for req.headers
interface CustomRequest {
	headers?: IncomingHttpHeaders; // Use IncomingHttpHeaders type for headers
	user?: IUser;
	authorization?: string;
	url?: string; // Add url property
}

export default async function authenticate(
	req: CustomRequest, // Use CustomRequest type
	res: Response,
	next: () => void,
) {
	let data;
	try {
		// Skip authentication for geo-clustered endpoint temporarily for testing
		if (req.url?.includes('/geo-clustered') || req.url?.includes('/top-properties')) {
			return next();
		}
		
		const token = extractBearerToken(req?.headers);
		if (!token) {
			return res.status(401).json({ error: 'Unauthorized', code: 401 });
		}
		const decoded = jwt.verify(token, JWT_SECRET);
		if (decoded.type != TokenTypeEnum.TOKEN) {
			return res
				.status(401)
				.json({ message: UserEnum.INVALID_TOKEN, error: 'Unauthorized', code: 401 });
		}
		req.user = {
			id: decoded?.id,
			role: decoded?.role,
			account_id: decoded?.account_id,
			first_name: decoded?.first_name,
			last_name: decoded?.last_name,
			approved_by_admin: decoded?.approved_by_admin,
			email_address: decoded?.email_address,
			comp_adjustment_mode: decoded?.comp_adjustment_mode,
		};

		if (!req?.user?.role) {
			data = {
				statusCode: StatusCodeEnum.BAD_REQUEST,
				error: UserEnum.INVALID_ROLE,
			};
			return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
		}

		if (!req?.user?.account_id) {
			data = {
				statusCode: StatusCodeEnum.BAD_REQUEST,
				error: UserEnum.INVALID_ACCOUNT_ID,
			};
			return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
		}
		return next();
	} catch (error) {
		return res.status(401).json({ message: error.message, error: 'Unauthorized', code: 401 });
	}
}
