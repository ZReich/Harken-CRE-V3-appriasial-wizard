import { Response } from 'express';
const SendResponse = <T>(res: Response, data: T, status: number) => {
	return res.status(status).json({ data });
};
export default SendResponse;
