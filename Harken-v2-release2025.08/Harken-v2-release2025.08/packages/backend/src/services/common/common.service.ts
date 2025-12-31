import StatusCodeEnum from '../../utils/enums/StatusCodeEnum';
import { Response } from 'express';
import SendResponse from '../../utils/common/commonResponse';
import CommonStore from './common.store';
import CoreLogicStore from '../corelogic/corelogic.store';
import PropertyStore from '../properties/property.store';
import HelperFunction from '../../utils/common/helper';
import { IError } from '../../utils/interfaces/common';
import { LoggerEnum } from '../../utils/enums/DefaultEnum';
import {
	IGetRequest,
	IGetWikipediaInfoRequest,
	IGlobalCodesListSuccess,
	ISearchPropertyRequest,
	IWikipediaSuccess,
	ICoreLogicPropertySearchSuccess,
	ICoreLogicSearchResponse,
	IGetPropertyRequest,
	ICoreLogicPropertyGetSuccess,
} from './ICommonService';
import { CommonEnum, WikipediaEnum, CoreLogicEnum } from '../../utils/enums/MessageEnum';
import { getPropertySchema, searchPropertySchema, wikipediaInfoSchema } from './common.validations';
import ErrorMessageEnum from '../../utils/enums/ErrorMessageEnum';
import axios, { AxiosRequestConfig } from 'axios';
import { GlobalCodeEnums } from '../../utils/enums/AppraisalsEnum';
import { CORELOGIC_FRESHNESS } from '../../env';

// Constants
const CORELOGIC_API_TIMEOUT = 15000;
const DEFAULT_BASE_URL = 'https://property.corelogicapi.com';

const helperFunction = new HelperFunction();

export default class CommonService {
	private storage = new CommonStore();
	private coreLogicStore = new CoreLogicStore();
	private propertyStore = new PropertyStore();
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

        const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(search.string)}`;
        // const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${search.string}`;

        // FIX: Wikipedia requires a User-Agent header
        const wikiInfo = await axios.get(url, {
            timeout: 10000,
            headers: {
               "User-Agent": "Harken-V2/1.0 (info)",
                "Accept": "application/json"
            }
        });

        if (wikiInfo.data?.query?.pages) {
            const pages = wikiInfo.data.query.pages;
            const page = pages[Object.keys(pages)[0]];

            if (page?.extract) {
                data = {
                    statusCode: StatusCodeEnum.OK,
                    message: WikipediaEnum.DATA_FOUND,
                    data: page.extract,
                };

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
	 * @description Search property using CoreLogic API
	 * @param request
	 * @param response
	 * @returns
	 */
	public searchProperty = async (
        request: ISearchPropertyRequest,
        response: Response,
    ): Promise<Response> => {
        let data: IError | ICoreLogicPropertySearchSuccess;
        try {
            // Check CoreLogic configuration before proceeding
            if (!process.env.CORELOGIC_BASE_URL || !process.env.CORELOGIC_CONSUMER_KEY || !process.env.CORELOGIC_CONSUMER_SECRET) {
                data = {
                    statusCode: StatusCodeEnum.OK,
                    message: CoreLogicEnum.MISSING_CREDENTIALS,
                };
                return SendResponse(response, data, StatusCodeEnum.OK);
            }

            // Validate the request schema
            const params = await helperFunction.validate(searchPropertySchema, request.body);
            if (!params.value) {
                data = {
                    statusCode: StatusCodeEnum.BAD_REQUEST,
                    message: ErrorMessageEnum.INVALID_REQUEST,
                    error: params,
                };
                return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
            }
			const searchParams = params.value;

            // Validate state against global codes if provided
            if (searchParams.state) {
                const validState = await this.storage.findGlobalCodeByAttribute({type: GlobalCodeEnums.STATES});
              const state = validState.options.find((option) => option.code === searchParams.state.toLowerCase());
                if (!state) {
                    data = {
                        statusCode: StatusCodeEnum.BAD_REQUEST,
                        message: CoreLogicEnum.INVALID_STATE_CODE,
                    };
                    return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
                }
            }
			searchParams.bestMatch = true;

            // Step 1: Search in local properties table first
            const localProperty = await this.propertyStore.findProperty({
                street_address: searchParams.streetAddress,
                city: searchParams.city,
                state: searchParams.state,
                zipcode: searchParams.zipCode,
            });

            // Check if property exists and corelogic_ts is fresh
            const isFresh = localProperty?.corelogic_ts && 
                (new Date().getTime() - new Date(localProperty.corelogic_ts).getTime()) / (1000 * 60 * 60 * 24) < CORELOGIC_FRESHNESS;

            if (localProperty && isFresh) {
                data = {
                    statusCode: StatusCodeEnum.OK,
                    message: CoreLogicEnum.PROPERTIES_FOUND,
                    data: { items: [localProperty], totalCount: 1, hasMoreResults: false },
                };
                helperFunction.log({
                    message: CoreLogicEnum.PROPERTY_FOUND_LOCAL,
                    location: await helperFunction.removeSubstring(__dirname, __filename),
                    level: LoggerEnum.INFO,
                    error: '',
                });
                return SendResponse(response, data, StatusCodeEnum.OK);
            }

            // Step 2: Get CoreLogic Bearer Token
            const token = await this.getCoreLogicToken();
            if (!token) {
                data = {
                    statusCode: StatusCodeEnum.UNAUTHORIZED,
                    message: CoreLogicEnum.TOKEN_REQUEST_FAILED,
                };
                return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
            }

            // Step 2: Search properties using CoreLogic API
            try {
                const propertySearchResult = await this.searchCoreLogicProperties(token, searchParams);
                
                if (propertySearchResult && propertySearchResult.items && propertySearchResult.items.length > 0) {
                    // If local property exists with null or old corelogic_ts, include both local and API data
                    if (localProperty && (!localProperty.corelogic_ts || !isFresh)) {
                        const combinedItems = [{ ...localProperty.toJSON(), property_id: localProperty.id }, ...propertySearchResult.items];
                        data = {
                            statusCode: StatusCodeEnum.OK,
                            message: CoreLogicEnum.PROPERTIES_FOUND,
                            data: { items: combinedItems, totalCount: combinedItems?.length, hasMoreResults: false },
                        };
                    } else {
                        data = {
                            statusCode: StatusCodeEnum.OK,
                            message: CoreLogicEnum.PROPERTIES_FOUND,
                            data: propertySearchResult,
                        };
                    }
                } 
                else {
                    data = {
                        statusCode: StatusCodeEnum.OK,
                        message: CoreLogicEnum.PROPERTIES_NOT_FOUND,
                        data: { items: [], totalCount: 0, hasMoreResults: false },
                    };
                }
            } catch (searchError) {
                if (searchError.message === CoreLogicEnum.QUOTA_EXCEEDED) {
                    data = {
                        statusCode: StatusCodeEnum.TOO_MANY_REQUESTS,
                        message: CoreLogicEnum.API_QUOTA_EXCEEDED,
                    };
                    return SendResponse(response, data, StatusCodeEnum.TOO_MANY_REQUESTS);
                }
                throw searchError;
            }

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
	
	/**
	 * @description Get property data using CoreLogic API
	 * @param request 
	 * @param response 
	 * @returns 
	 */
	public getPropertyData = async (
        request: IGetPropertyRequest,
        response: Response,
    ): Promise<Response> => {
        let data: IError | ICoreLogicPropertyGetSuccess;
        try {
            //Check CoreLogic configuration before proceeding
            if (!process.env.CORELOGIC_BASE_URL || !process.env.CORELOGIC_CONSUMER_KEY || !process.env.CORELOGIC_CONSUMER_SECRET) {
                data = {
                    statusCode: StatusCodeEnum.OK,
                    message: CoreLogicEnum.MISSING_CREDENTIALS,
                };
                return SendResponse(response, data, StatusCodeEnum.OK);
            }
            // Validate the request schema
            const params = await helperFunction.validate(getPropertySchema, request.query);
            if (!params.value) {
                data = {
                    statusCode: StatusCodeEnum.BAD_REQUEST,
                    message: ErrorMessageEnum.INVALID_REQUEST,
                    error: params,
                };
                return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
            }
			const clipId = params.value?.clipId;
            const propertyId = Number(params.value?.propertyId);
            // Ensure at least one identifier is provided
            if (!clipId && !propertyId) {
                data = {
                    statusCode: StatusCodeEnum.BAD_REQUEST,
                    message: CoreLogicEnum.CLIPID_OR_PROPERTYID_REQUIRED,
                };
                return SendResponse(response, data, StatusCodeEnum.BAD_REQUEST);
            }

            // Step 1: Check if property exists in local database
            const localProperty = await this.propertyStore.findProperty({ id: propertyId });
            
            // Check if corelogic_ts is fresh
            const isFresh = localProperty?.corelogic_ts && 
                (new Date().getTime() - new Date(localProperty.corelogic_ts).getTime()) / (1000 * 60 * 60 * 24) < CORELOGIC_FRESHNESS;

            // If data is fresh, get from corelogic table
            if (localProperty && isFresh) {
                const cachedData = await this.coreLogicStore.getCoreLogicData(propertyId);
                if (cachedData) {
                    const propertyDetails = this.buildPropertyDetails({
                        propertyData: cachedData.property_detail ? JSON.parse(cachedData.property_detail) : null,
                        buildingData: cachedData.building_detail ? JSON.parse(cachedData.building_detail) : null,
                        siteLocationData: cachedData.site_location ? JSON.parse(cachedData.site_location) : null,
                        taxAssessmentsData: cachedData.tax_assessments ? JSON.parse(cachedData.tax_assessments) : null,
                        ownershipData: cachedData.ownership ? JSON.parse(cachedData.ownership) : null,
                        ownershipTransferData: cachedData.ownership_transfer ? JSON.parse(cachedData.ownership_transfer) : null,
                        transactionHistoryData: cachedData.transaction_history ? JSON.parse(cachedData.transaction_history) : null
                    });
                    helperFunction.log({
                        message: CoreLogicEnum.CACHED_DATA_SERVED,
                        location: await helperFunction.removeSubstring(__dirname, __filename),
                        level: LoggerEnum.INFO,
                        error: '',
                    });
                    return this.sendSuccessResponse(
                        response,
                        CoreLogicEnum.PROPERTIES_FOUND,
                        propertyDetails
                    );
                }
            }

            // Step 2: Get CoreLogic Bearer Token
            const token = await this.getCoreLogicToken();
            if (!token) {
                data = {
                    statusCode: StatusCodeEnum.UNAUTHORIZED,
                    message: CoreLogicEnum.TOKEN_REQUEST_FAILED,
                };
                return SendResponse(response, data, StatusCodeEnum.UNAUTHORIZED);
            }

            // Fetch all property data concurrently for better performance
            const [propertyData, buildingData, siteLocationData, taxAssessmentsData, ownershipData, ownershipTransferData, transactionHistoryData] = await Promise.allSettled([
                this.getCoreLogicProperties(token, clipId),
                this.getCoreLogicBuildingDetails(token, clipId),
                this.getCoreLogicSiteDetails(token, clipId),
                this.getCoreLogicTaxAssessmentsDetails(token, clipId),
                this.getCoreLogicOwnershipDetails(token, clipId),
                this.getCoreLogicOwnershipTransferDetails(token, clipId),
                this.getCoreLogicTransactionHistoryDetails(token, clipId)
            ]);

            const propertyDetails = this.buildPropertyDetails({
                propertyData: this.extractValue(propertyData),
                buildingData: this.extractValue(buildingData),
                siteLocationData: this.extractValue(siteLocationData),
                taxAssessmentsData: this.extractValue(taxAssessmentsData),
                ownershipData: this.extractValue(ownershipData),
                ownershipTransferData: this.extractValue(ownershipTransferData),
                transactionHistoryData: this.extractValue(transactionHistoryData)
            });

            // Save to corelogic table and update timestamp
            if (propertyDetails) {
                let propertyId = localProperty?.id;
                
                // Create new property if it doesn't exist
                if (!localProperty) {
                    const newProperty = await this.propertyStore.createProperty(propertyDetails);
                    propertyId = newProperty?.id;
                }
                
                // Store CoreLogic data and update timestamp
                if (propertyId) {
                    await this.coreLogicStore.storeCoreLogicData(propertyId, {
                        propertyData: this.extractValue(propertyData),
                        buildingData: this.extractValue(buildingData),
                        siteLocationData: this.extractValue(siteLocationData),
                        taxAssessmentsData: this.extractValue(taxAssessmentsData),
                        ownershipData: this.extractValue(ownershipData),
                        ownershipTransferData: this.extractValue(ownershipTransferData),
                        transactionHistoryData: this.extractValue(transactionHistoryData)
                    });
                    if (localProperty) {
                        await this.propertyStore.updateCoreLogicTimestamp(propertyId);
                    }
                }
            }  
            return this.sendSuccessResponse(
                response,
                propertyDetails ? CoreLogicEnum.PROPERTIES_FOUND : CoreLogicEnum.PROPERTIES_NOT_FOUND,
                propertyDetails || {}
            );
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
     * @description Get CoreLogic Bearer Token
     * @returns Promise<string | null>
     */
    private getCoreLogicToken = async (): Promise<string | null> => {
        try {
            const clientId = process.env.CORELOGIC_CONSUMER_KEY;
            const clientSecret = process.env.CORELOGIC_CONSUMER_SECRET;
            
            if (!clientId || !clientSecret) {
                throw new Error(CoreLogicEnum.INVALID_CREDENTIALS);
            }

            const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            
            const tokenResponse = await axios.post(
                'https://api-prod.corelogic.com/oauth/token?grant_type=client_credentials',
                {},
                {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    timeout: CORELOGIC_API_TIMEOUT,
                }
            );

            return tokenResponse.data.access_token;
        } catch (error) {
            //logging error
            helperFunction.log({
                message: `CoreLogic token request failed: ${error.message}`,
                location: await helperFunction.removeSubstring(__dirname, __filename),
                level: LoggerEnum.ERROR,
                error: error,
            });
            return null;
        }
    };

    /**
     * @description Search properties in CoreLogic API
     * @param token Bearer token
     * @param searchParams Search parameters
     * @returns Promise<ICoreLogicSearchResponse | null>
     */
    private searchCoreLogicProperties = async (
        token: string,
        searchParams: any
    ): Promise<ICoreLogicSearchResponse | null> => {
        try {
            const baseUrl = this.getBaseUrl();
            const queryParams = new URLSearchParams({
                streetAddress: searchParams.streetAddress,
                zipCode: searchParams.zipCode,
                bestMatch: 'true',
                ...(searchParams.city && { city: searchParams.city }),
                ...(searchParams.state && { state: searchParams.state }),
            });

            const url = `${baseUrl}/v2/properties/search?${queryParams.toString()}`;
            const config = this.createAxiosConfig(token);
            
            const response = await axios.get(url, config);
            return response.data;
        } catch (error) {
            // Check for quota exceeded (429 status code)
            if (error.response?.status === 429) {
                throw new Error( CoreLogicEnum.QUOTA_EXCEEDED );
            }
            //logging error
            helperFunction.log({
                message: `CoreLogic property search failed: ${error.message}`,
                location: await helperFunction.removeSubstring(__dirname, __filename),
                level: LoggerEnum.ERROR,
                error: error,
            });
            return null;
        }
    };

    /**
     * @description Get property data using CoreLogic API
     * @param token Bearer token
     * @param clipId Property clip ID
     * @returns
     */
    private getCoreLogicProperties = async (
        token: string,
        clipId: string
    ): Promise<any | null> => {
        try {
            const baseUrl = this.getBaseUrl();
            const url = `${baseUrl}/v2/properties/${clipId}/property-detail`;
            const config = this.createAxiosConfig(token);
            
            const response = await axios.get(url, config);
            return response.data;
        } catch (error) {
            //logging error
            helperFunction.log({
                message: `CoreLogic property search failed: ${error.message}`,
                location: await helperFunction.removeSubstring(__dirname, __filename),
                level: LoggerEnum.ERROR,
                error: error,
            });
            return null;
        }
    };

    /**
     * @description Get building data using CoreLogic API
     * @param token Bearer token
     * @param clipId Property clip ID
     * @returns
     */
    private getCoreLogicBuildingDetails = async (token: string, clipId: string): Promise<any | null> => {
        try {
            const baseUrl = this.getBaseUrl();
            const url = `${baseUrl}/v2/properties/${clipId}/buildings`;
            const config = this.createAxiosConfig(token);
            
            const response = await axios.get(url, config);
            return response.data?.data;
        } catch (error) {
            //logging error
            helperFunction.log({
                message: `CoreLogic property search failed: ${error.message}`,
                location: await helperFunction.removeSubstring(__dirname, __filename),
                level: LoggerEnum.ERROR,
                error: error,
            });
            return null;
        }
    };

    /**
     * @description Get site location data using CoreLogic API
     * @param token Bearer token
     * @param clipId Property clip ID
     * @returns
     */
    private getCoreLogicSiteDetails = async (
        token: string,
        clipId: string
    ): Promise<any | null> => {
        try {
            const baseUrl = this.getBaseUrl();
            const url = `${baseUrl}/v2/properties/${clipId}/site-location`;
            const config = this.createAxiosConfig(token);
            
            const response = await axios.get(url, config);
            return response.data?.data;
        } catch (error) {
            //logging error
            helperFunction.log({
                message: `CoreLogic property search failed: ${error.message}`,
                location: await helperFunction.removeSubstring(__dirname, __filename),
                level: LoggerEnum.ERROR,
                error: error,
            });
            return null;
        }
    };

    /**
     * @description Get tax assessments data using CoreLogic API
     * @param token Bearer token
     * @param clipId Property clip ID
     * @returns
     */
    private getCoreLogicTaxAssessmentsDetails = async (
        token: string,
        clipId: string
    ): Promise<any | null> => {
        try {
            const baseUrl = this.getBaseUrl();
            const url = `${baseUrl}/v2/properties/${clipId}/tax-assessments/latest`;
            const config = this.createAxiosConfig(token);
            
            const response = await axios.get(url, config);
            return response.data?.items?.[0];
        } catch (error) {
            //logging error
            helperFunction.log({
                message: `CoreLogic property search failed: ${error.message}`,
                location: await helperFunction.removeSubstring(__dirname, __filename),
                level: LoggerEnum.ERROR,
                error: error,
            });
            return null;
        }
    };

    /**
     * @description Get ownership data using CoreLogic API
     * @param token Bearer token
     * @param clipId Property clip ID
     * @returns
     */
    private getCoreLogicOwnershipDetails = async (
        token: string,
        clipId: string
    ): Promise<any | null> => {
        try {
            const baseUrl = this.getBaseUrl();
            const url = `${baseUrl}/v2/properties/${clipId}/ownership`;
            const config = this.createAxiosConfig(token);
            
            const response = await axios.get(url, config);
            return response.data?.data;
        } catch (error) {
            //logging error
            helperFunction.log({
                message: `CoreLogic property search failed: ${error.message}`,
                location: await helperFunction.removeSubstring(__dirname, __filename),
                level: LoggerEnum.ERROR,
                error: error,
            });
            return null;
        }
    };

    /**
     * @description Get ownership transfer data using CoreLogic API
     * @param token Bearer token
     * @param clipId Property clip ID
     * @returns
     */
    private getCoreLogicOwnershipTransferDetails = async (
        token: string,
        clipId: string
    ): Promise<any | null> => {
        try {
            const baseUrl = this.getBaseUrl();
            const url = `${baseUrl}/v2/properties/${clipId}/ownership-transfers/all/latest`;
            const config = this.createAxiosConfig(token);
            
            const response = await axios.get(url, config);
            return response.data?.items?.[0];
        } catch (error) {
            //logging error
            helperFunction.log({
                message: `CoreLogic property search failed: ${error.message}`,
                location: await helperFunction.removeSubstring(__dirname, __filename),
                level: LoggerEnum.ERROR,
                error: error,
            });
            return null;
        }
    };

    /**
     * @description Get transaction history data using CoreLogic API
     * @param token Bearer token
     * @param clipId Property clip ID
     * @returns
     */
    private getCoreLogicTransactionHistoryDetails = async (
        token: string,
        clipId: string
    ): Promise<any | null> => {
        try {
            const baseUrl = this.getBaseUrl();
            const url = `${baseUrl}/v2/properties/${clipId}/transaction-history`;
            const config = this.createAxiosConfig(token);
            
            const response = await axios.get(url, config);
            return response.data?.items?.[0];
        } catch (error) {
            //logging error
            helperFunction.log({
                message: `CoreLogic property search failed: ${error.message}`,
                location: await helperFunction.removeSubstring(__dirname, __filename),
                level: LoggerEnum.ERROR,
                error: error,
            });
            return null;
        }
    };

    /**
     * @description Extract value from Promise.allSettled result
     */
    private extractValue(result: PromiseSettledResult<any>): any {
        return result.status === 'fulfilled' ? result.value : null;
    }

    /**
     * @description Build comprehensive property details from API responses
     */
    private buildPropertyDetails(data: any): any {
        const { propertyData, buildingData, siteLocationData, taxAssessmentsData, ownershipData, ownershipTransferData, transactionHistoryData } = data;
        
        const propertyAddress = propertyData?.mostRecentOwnerTransfer?.items?.[0]?.recordedPropertyAddress;
        const building = buildingData?.buildings?.[0];
        
        return {
            // Address details
            street_address: propertyAddress?.streetAddress || null,
            city: propertyAddress?.city || null,
            state: propertyAddress?.state || null,
            zipcode: propertyAddress?.zipCode || null,
            county: propertyAddress?.county || null,
            
            // Building details
            building_size: buildingData?.allBuildingsSummary?.totalAreaSquareFeet || buildingData?.allBuildingsSummary?.livingAreaSquareFeet || null,
            year_built: building?.constructionDetails?.yearBuilt || null,
            foundation: building?.constructionDetails?.foundationTypeCode || null,
            condition: building?.constructionDetails?.buildingImprovementConditionCode || null,
            no_stories: building?.structureVerticalProfile?.storiesCount || null,
            property_class: building?.structureClassification?.buildingClassCode || null,
            parking: building?.structureExterior?.parking?.parkingSpacesCount || null,
            basement: building?.structureInterior?.basement?.finishTypeCode || null,
            exterior: building?.structureExterior?.walls?.typeCode || null,
            roof: building?.structureExterior?.roof?.coverTypeCode || null,
            electrical: building?.structureFeatures?.plumbing?.typeCode || null,
            plumbing: building?.structureFeatures?.plumbing?.typeCode || null,
            heating_cooling: this.combineHeatingCooling(building?.structureFeatures),
            windows: building?.structureFeatures?.dormerWindows?.count || null,
            bedrooms: building?.interiorRooms?.bedroomsCount || null,
            bathrooms: building?.interiorRooms?.bathroomsCount || null,
            fireplaces: building?.structureFeatures?.firePlaces?.count || null,
            zonings: buildingData?.buildings?.map((bldg: any) => ({ sq_ft: bldg?.interiorArea?.universalBuildingAreaSquareFeet })) || [],
            res_zonings: buildingData?.buildings?.map((bldg: any) => ({
                gross_living_sq_ft: bldg?.interiorArea?.livingAreaSquareFeet,
                basement_finished_sq_ft: bldg?.interiorArea?.finishedBasementAreaSquareFeet,
                basement_unfinished_sq_ft: bldg?.interiorArea?.unfinishedBasementAreaSquareFeet
            })) || [],
            
            // Land details
            land_size: siteLocationData?.lot?.areaSquareFeet || siteLocationData?.lot?.areaAcres || null,
            topography: siteLocationData?.lot?.topographyType || null,
            frontage: siteLocationData?.lot?.frontFeet || null,
            utilities: Object.values({
                sewer: siteLocationData?.utilities?.sewerTypeCode || null,
                water: siteLocationData?.utilities?.waterTypeCode || null,
                electricity: siteLocationData?.utilities?.electricityWiringTypeCode || null,
                fuel: siteLocationData?.utilities?.fuelTypeCode || null,
            })
            .filter(value => value !== null && value !== '')
            .join(', '),
            zoning_type: siteLocationData?.landUseAndZoningCodes?.zoningCode || null,
            zoning_description: siteLocationData?.landUseAndZoningCodes?.zoningCodeDescription || null,
            lot_shape: siteLocationData?.lot?.shapeCode || null,
            lot_depth: siteLocationData?.lot?.depthFeet || null,
            front_feet: siteLocationData?.lot?.frontFeet || null,
            latitude: siteLocationData?.coordinatesParcel?.lat || null,
            longitude: siteLocationData?.coordinatesParcel?.lng || null,
            
            // Tax assessment details
            land_assessment: taxAssessmentsData?.assessedValue?.calculatedLandValue || taxAssessmentsData?.assessedValue?.taxableLandValue || null,
            structure_assessment: taxAssessmentsData?.assessedValue?.calculatedImprovementValue || taxAssessmentsData?.assessedValue?.taxableImprovementValue || null,
            tax_liability: taxAssessmentsData?.taxAmount?.totalTaxAmount || null,
            taxes_in_arrears: taxAssessmentsData?.taxAmount?.delinquentYear || null,
            
            // Ownership details
            owner_of_record: ownershipData?.currentOwners?.ownerNames?.[0]?.fullName || null,
            
            // Transfer details
            last_transferred_date: ownershipTransferData?.transactionDetails?.saleDateDerived || ownershipTransferData?.transactionDetails?.saleRecordingDateDerived || null,
            sale_price: ownershipTransferData?.transactionDetails?.saleAmount || transactionHistoryData?.ownershipTransfers?.[0]?.transactionDetails?.saleAmount || null,
            date_sold: ownershipTransferData?.transactionDetails?.saleDateDerived || transactionHistoryData?.ownershipTransfers?.[0]?.transactionDetails?.saleDateDerived || null,
            buyer_name: ownershipTransferData?.buyerDetails?.buyerNames?.map((buyer: any) => buyer.fullName) || [],
            seller_name: ownershipTransferData?.sellerDetails?.sellerNames?.map((seller: any) => seller.fullName) || [],
        };
    }

    /**
     * @description Combine heating and cooling information
     */
    private combineHeatingCooling(features: any): string | null {
        const heating = features?.heating?.typeCode;
        const cooling = features?.airConditioning?.typeCode;
        if (heating && cooling) return `${cooling} ${heating}`;
        return heating || cooling || null;
    }

    /**
     * @description Send success response
     */
    private async sendSuccessResponse(response: Response, message: string, data?: any): Promise<Response> {
        const responseData = {
            statusCode: StatusCodeEnum.OK,
            message,
            ...(data !== undefined && { data })
        };
        
        await this.logResponse(message, LoggerEnum.INFO);
        return SendResponse(response, responseData, StatusCodeEnum.OK);
    }

    /**
     * @description Log response
     */
    private async logResponse(message: string, level: LoggerEnum, error?: any): Promise<void> {
        helperFunction.log({
            message,
            location: await helperFunction.removeSubstring(__dirname, __filename),
            level,
            error: error || ''
        });
    }

    /**
     * @description Create axios config with common settings
     */
    private createAxiosConfig(token?: string): AxiosRequestConfig {
        const config: AxiosRequestConfig = {
            timeout: CORELOGIC_API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            config.headers!['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    }

    /**
     * @description Get base URL for CoreLogic API
     */
    private getBaseUrl(): string {
        return process.env.CORELOGIC_BASE_URL || DEFAULT_BASE_URL;
    }
}
