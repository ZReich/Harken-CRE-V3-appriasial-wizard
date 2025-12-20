import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import { IError, ISuccess, Response } from '../../utils/interfaces/common';
import SendResponse from '../../utils/common/commonResponse';
import {
	IDeleteRequest,
	IURLSuccessData,
	IUploadRequest,
	IUploadSuccess,
	IUploadPhotosRequest,
	IPhotoPagesSuccess,
} from '../../services/uploadFiles/IUploadService';
import HelperFunction from '../../utils/common/helper';
import { deleteFileSchema, uploadFileSchema } from './uploadFile.validations';
import { S3_BASE_URL } from '../../env';
import { FileEnum } from '../../utils/enums/MessageEnum';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import AppraisalFilesStore from '../appraisalFiles/appraisalFiles.store';
import UploadFunction from '../../utils/common/upload';

const helperFunction = new HelperFunction();
const uploadFunction = new UploadFunction();
export default class UploadFileService {
	private appraisalFilesStorage = new AppraisalFilesStore();
	constructor() {}

	/**
	 * @description function to upload file to s3 bucket
	 * @param request
	 * @param response
	 * @returns
	 */
	public uploadFile = async (request: IUploadRequest, response: Response): Promise<Response> => {
		let data: IError | IUploadSuccess<IURLSuccessData>;
		try {
			// Validate schema
			const params = await helperFunction.validate(uploadFileSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { id, type, urlToDelete } = request.body;
			if (urlToDelete) {
				const fileUrl = await helperFunction.removeSubstring(S3_BASE_URL, urlToDelete);
				uploadFunction.removeFromServer(fileUrl);
			}
			const url = S3_BASE_URL + (await uploadFunction.addFile({ file: request.file, id, type }));
			if (url) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: FileEnum.FILE_UPLOAD_SUCCESS,
					data: { url },
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			data = {
				statusCode: StatusCodeEnum.BAD_REQUEST,
				message: FileEnum.FILE_UPLOAD_FAIL,
			};
			return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description function to delete uploaded file from s3 bucket
	 * @param request
	 * @param response
	 * @returns
	 */
	public delete = async (request: IDeleteRequest, response: Response): Promise<Response> => {
		let data: IError | ISuccess;
		try {
			// Validate schema
			const params = await helperFunction.validate(deleteFileSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { file_path } = request.body;

			const file_url = await helperFunction.removeSubstring(S3_BASE_URL, file_path);

			const filename = await uploadFunction.removeFromServer(file_url);
			if (filename) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: FileEnum.FILE_DELETE_SUCCESS,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			data = {
				statusCode: StatusCodeEnum.BAD_REQUEST,
				message: FileEnum.FILE_DELETE_FAIL,
			};
			return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};

	/**
	 * @description Function to upload multiple photos at once.
	 * @param request
	 * @param response
	 * @returns
	 */
	public uploadMultiplePhotos = async (
		request: IUploadPhotosRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IPhotoPagesSuccess<IURLSuccessData[]>;
		try {
			// Validate schema
			const params = await helperFunction.validate(uploadFileSchema, request.body);
			if (!params.value) {
				data = {
					statusCode: StatusCodeEnum.BAD_REQUEST,
					message: ErrorMessageEnum.INVALID_REQUEST,
					error: params,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			const { type } = request.body;
			const files = request.files;
			const photoUrls = [];
			if (files) {
				for (const file of files) {
					const url = S3_BASE_URL + (await uploadFunction.addFile({ file, type }));
					photoUrls.push(url);
				}
			}
			if (photoUrls?.length) {
				data = {
					statusCode: StatusCodeEnum.OK,
					message: FileEnum.FILE_UPLOAD_SUCCESS,
					data: photoUrls,
				};
				//logging information
				helperFunction.log({
					message: data.message,
					location: await helperFunction.removeSubstring(__dirname, __filename),
					level: LoggerEnum.INFO,
					error: '',
				});
				return SendResponse(response, data, StatusCodeEnum.OK);
			}
			data = {
				statusCode: StatusCodeEnum.BAD_REQUEST,
				message: FileEnum.FILE_UPLOAD_FAIL,
			};
			return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message,
				error: e,
			};
			//logging error
			helperFunction.log({
				message: e.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: e,
			});
			return SendResponse(response, data, StatusCodeEnum.INTERNAL_SERVER_ERROR);
		}
	};
}
