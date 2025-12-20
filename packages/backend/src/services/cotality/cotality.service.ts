import { COTALITY_API_KEY } from '../../env';
import axios from 'axios';
import { mapToCompsFields, mapToSalesApproachFields, mapToCostApproachFields, mapToIncomeApproachFields, mapToLeaseApproachFields, mapToCapRateApproachFields } from './cotality.fieldMapper';

export interface CotalityPropertyResponse {
	property?: any;
	status?: {
		code?: number;
		msg?: string;
	};
	[key: string]: any;
}

export class CotalityService {
	private readonly baseUrl = 'https://api.gateway.attomdata.com/property/v2';
	private readonly apiKey: string;

	constructor() {
		if (!COTALITY_API_KEY) {
			throw new Error('COTALITY_API_KEY is not configured');
		}
		this.apiKey = COTALITY_API_KEY;
	}

	/**
	 * Get property by PropId using ExpandedProfile endpoint
	 */
	async getPropertyByPropId(propId: string): Promise<CotalityPropertyResponse> {
		try {
			const response = await axios.get(
				`${this.baseUrl}/ExpandedProfile/PropId/${propId}`,
				{
					headers: {
						apikey: this.apiKey,
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					timeout: 15000,
				}
			);
			return response.data;
		} catch (error: any) {
			console.error('Error fetching property from Cotality by PropId:', error.message);
			if (error.response) {
				console.error('Response status:', error.response.status);
				console.error('Response data:', error.response.data);
			}
			throw error;
		}
	}

	/**
	 * Get property by address using ExpandedProfile endpoint
	 */
	async getPropertyByAddress(
		address: string,
		city: string,
		state: string,
		zipcode?: string
	): Promise<CotalityPropertyResponse> {
		try {
			// Build query parameters
			const params = new URLSearchParams({
				address1: address,
				city: city,
				state: state,
			});
			if (zipcode) {
				params.append('postalcode', zipcode);
			}

			const response = await axios.get(
				`${this.baseUrl}/ExpandedProfile/Address?${params.toString()}`,
				{
					headers: {
						apikey: this.apiKey,
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					timeout: 15000,
				}
			);
			return response.data;
		} catch (error: any) {
			console.error('Error fetching property from Cotality by Address:', error.message);
			if (error.response) {
				console.error('Response status:', error.response.status);
				console.error('Response data:', error.response.data);
			}
			throw error;
		}
	}

	/**
	 * Map Cotality API response to Harken comps model
	 */
	mapToCompsModel(cotalityData: CotalityPropertyResponse): Partial<any> {
		return mapToCompsFields(cotalityData);
	}

	/**
	 * Get field mapping documentation for all approaches
	 */
	getFieldMappingDocumentation() {
		return {
			comps: mapToCompsFields({} as CotalityPropertyResponse, true),
			salesApproach: mapToSalesApproachFields({} as CotalityPropertyResponse, true),
			costApproach: mapToCostApproachFields({} as CotalityPropertyResponse, true),
			incomeApproach: mapToIncomeApproachFields({} as CotalityPropertyResponse, true),
			leaseApproach: mapToLeaseApproachFields({} as CotalityPropertyResponse, true),
			capRateApproach: mapToCapRateApproachFields({} as CotalityPropertyResponse, true),
		};
	}
}


