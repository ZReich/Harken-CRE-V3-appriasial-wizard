import { Response, Request } from 'express';
import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import SendResponse from '../../utils/common/commonResponse';

interface AdminRequest extends Request {
	user: any;
}

export default class AdminAccountsService {
	public listAccounts = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};

	public getAccount = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};

	public createAccount = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};

	public updateAccount = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};

	public updateSubscription = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};

	public getInvoices = async (request: AdminRequest, response: Response): Promise<Response> => {
		return SendResponse(response, { statusCode: StatusCodeEnum.OK, message: 'Not implemented' }, StatusCodeEnum.OK);
	};
}

