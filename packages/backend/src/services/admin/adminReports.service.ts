import { Response, Request } from 'express';
import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import SendResponse from '../../utils/common/commonResponse';

interface AdminRequest extends Request {
	user: any;
}

export default class AdminReportsService {
	public getUsageReport = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};

	public getContentReport = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};

	public getBillingReport = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};

	public getSystemReport = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};

	public getDashboardReport = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};
}

