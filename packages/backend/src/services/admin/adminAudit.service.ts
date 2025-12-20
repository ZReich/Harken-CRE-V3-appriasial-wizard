import { Response, Request } from 'express';
import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import SendResponse from '../../utils/common/commonResponse';

interface AdminRequest extends Request {
	user: any;
}

export default class AdminAuditService {
	public getAuditLogs = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};

	public getAuditLog = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};
}

