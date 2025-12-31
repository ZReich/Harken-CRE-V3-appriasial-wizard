import { GOOGLE_MAPS_API_KEY } from '../../env';
import HelperFunction from './helper';
import { LoggerEnum } from '../enums/DefaultEnum';

interface GooglePlaceResult {
	place_id: string;
	formatted_address: string;
	geometry: {
		location: {
			lat: number;
			lng: number;
		};
	};
	types: string[];
}

interface GooglePlacesResponse {
	candidates: GooglePlaceResult[];
	status: string;
}

export default class GooglePlacesService {
	private helperFunction = new HelperFunction();

	/**
	 * Validates an address using Google Places API and returns the best match
	 * @param address - The address to validate
	 * @returns Promise with validation result including place_id, coordinates, and formatted address
	 */
	public async validateAddress(address: string): Promise<{
		isValid: boolean;
		place_id?: string;
		latitude?: number;
		longitude?: number;
		formatted_address?: string;
		confidence?: 'exact' | 'partial' | 'low';
		message?: string;
	}> {
		try {
			if (!GOOGLE_MAPS_API_KEY) {
				console.log('Google Maps API key is not configured');
				throw new Error('Google Maps API key is not configured');
			}

			const encodedAddress = encodeURIComponent(address);
			const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodedAddress}&inputtype=textquery&fields=place_id,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`;

			const response = await fetch(url);
			const data: GooglePlacesResponse = await response.json();

			if (data.status === 'OK' && data.candidates.length > 0) {
				const result = data.candidates[0];
				return {
					isValid: true,
					place_id: result.place_id,
					latitude: result.geometry.location.lat,
					longitude: result.geometry.location.lng,
					formatted_address: result.formatted_address,
					confidence: 'exact',
				};
			} else if (data.status === 'ZERO_RESULTS') {
				// Try with a broader search using Places API
				return await this.searchAddressAlternatives(address);
			} else {
				console.log('Google Places API error:', data.status);
				return {
					isValid: false,
					message: `Google Places API error: ${data.status}`,
				};
			}
		} catch (error) {
			// Log the error
			this.helperFunction.log({
				message: `Error validating address: ${error.message}`,
				location: await this.helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			console.log('Error validating address:', error.message);

			return {
				isValid: false,
				message: 'Failed to validate address due to API error',
			};
		}
	}

	/**
	 * Searches for address alternatives when exact match is not found
	 * @param address - The address to search for
	 * @returns Promise with alternative matches
	 */
	private async searchAddressAlternatives(address: string): Promise<{
		isValid: boolean;
		place_id?: string;
		latitude?: number;
		longitude?: number;
		formatted_address?: string;
		confidence?: 'exact' | 'partial' | 'low';
		message?: string;
	}> {
		try {
			const encodedAddress = encodeURIComponent(address);
			const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedAddress}&fields=place_id,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`;

			const response = await fetch(url);
			const data: GooglePlacesResponse = await response.json();

			if (data.status === 'OK' && data.candidates.length > 0) {
				const result = data.candidates[0];
				return {
					isValid: true,
					place_id: result.place_id,
					latitude: result.geometry.location.lat,
					longitude: result.geometry.location.lng,
					formatted_address: result.formatted_address,
					confidence: 'partial',
				};
			} else {
				return {
					isValid: false,
					message: 'No matching addresses found',
				};
			}
		} catch (error) {
			return {
				isValid: false,
				message: 'Failed to search for address alternatives',
			};
		}
	}

	/**
	 * Gets detailed place information using place_id
	 * @param place_id - The Google Place ID
	 * @returns Promise with detailed place information
	 */
	public async getPlaceDetails(place_id: string): Promise<{
		success: boolean;
		details?: any;
		message?: string;
	}> {
		try {
			if (!GOOGLE_MAPS_API_KEY) {
				throw new Error('Google Maps API key is not configured');
			}

			const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=formatted_address,geometry,address_components&key=${GOOGLE_MAPS_API_KEY}`;

			const response = await fetch(url);
			const data = await response.json();

			if (data.status === 'OK') {
				return {
					success: true,
					details: data.result,
				};
			} else {
				return {
					success: false,
					message: `Google Places API error: ${data.status}`,
				};
			}
		} catch (error) {
			return {
				success: false,
				message: 'Failed to get place details',
			};
		}
	}
}
