import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import { Response } from 'express';
import SendResponse from '../../utils/common/commonResponse';
import CommonStore from './common.store';
import HelperFunction from '../../utils/common/helper';
import { IError } from '../../utils/interfaces/common';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import {
	IGetRequest,
	IGetWikipediaInfoRequest,
	IGlobalCodesListSuccess,
	IWikipediaSuccess,
} from './ICommonService';
import { CommonEnum, WikipediaEnum } from '../../utils/enums/MessageEnum';
import { wikipediaInfoSchema } from './common.validations';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import axios from 'axios';
const helperFunction = new HelperFunction();

export default class CommonService {
	private storage = new CommonStore();
	constructor() {}

	/**
	 * @description Get list of globale codes
	 * @param request
	 * @param response
	 * @returns
	 */
	public getAllGlobalCodes = async (
		request: IGetRequest,
		response: Response,
	): Promise<Response> => {
		let data: IError | IGlobalCodesListSuccess;
		try {
			const attributes = { status: 1 };
			// Get codes by attribute
			const globalCodes = await this.storage.getGlobalCodeCategoriesByAttribute(attributes);
			if (!globalCodes) {
				data = {
					statusCode: StatusCodeEnum.NOT_FOUND,
					message: CommonEnum.GLOBAL_CODE_CATEGORY_NOT_FOUND,
				};
				return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
			}
			data = {
				statusCode: StatusCodeEnum.OK,
				message: CommonEnum.GLOBAL_CODE_CATEGORIES_LIST,
				data: globalCodes,
			};
			//logging information
			helperFunction.log({
				message: data.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.INFO,
				error: '',
			});
			return SendResponse(response, data, StatusCodeEnum.OK);
		} catch (e) {
			data = {
				statusCode: StatusCodeEnum.INTERNAL_SERVER_ERROR,
				message: e.message || e,
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
	 * @description Function to get info from wikipedia
	 * @param request
	 * @param response
	 * @returns
	 */
public getWikipediaInfo = async (
        request: IGetWikipediaInfoRequest,
        response: Response,
    ): Promise<Response> => {
        let data: IError | IWikipediaSuccess<string>;
        try {
            // Validate the request schema
            const params = await helperFunction.validate(wikipediaInfoSchema, request.body);
            if (!params.value) {
                data = {
                    statusCode: StatusCodeEnum.BAD_REQUEST,
                    message: ErrorMessageEnum.INVALID_REQUEST,
                    error: params,
                };
                return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
            }
            const search = params.value;
			// Url of wikipedia query
            const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(search.string)}`;
 			// const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${search.string}`;

			// Attempt to search data from wikipedia
            const wikiInfo = await axios.get(url, { timeout: 10000 });
			// const wikiInfo = await axios.get(url);
 
            if (wikiInfo.data?.query?.pages) {
                const pages = wikiInfo.data.query.pages;
                const page = pages[Object.keys(pages)[0]];
 
                if (page?.extract) {
                    data = {
                        statusCode: StatusCodeEnum.OK,
                        message: WikipediaEnum.DATA_FOUND,
                        data: page.extract,
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
            }
 
            data = {
                statusCode: StatusCodeEnum.OK,
                message: WikipediaEnum.DATA_NOT_FOUND,
                data: '',
            };
			//logging information
            helperFunction.log({
                message: data.message,
                location: await helperFunction.removeSubstring(__dirname, __filename),
                level: LoggerEnum.INFO,
                error: '',
            });
            return SendResponse(response, data, StatusCodeEnum.OK);
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
