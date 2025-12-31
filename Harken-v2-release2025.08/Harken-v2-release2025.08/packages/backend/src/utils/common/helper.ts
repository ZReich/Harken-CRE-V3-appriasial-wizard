import CompsEnum from '../enums/CompsEnum';
import Joi from 'joi';
import ErrorMessageEnum from '../enums/ErrorMessageEnum';
import logger from './logger';
import { ILog, Zoning, ZoningChildren, ZoningValue } from '../interfaces/common';
import AppraisalsEnum from '../enums/AppraisalsEnum';
import { DownloadCompEnum } from '../enums/MessageEnum';
import pdf from 'pdf-parse';
import fs from 'fs';

// Define custom date format validator
export const dateFormatValidator = Joi.extend((joi) => ({
	type: 'date',
	base: joi.string(),
	messages: {
		'date.base': '{{#label}} ' + ErrorMessageEnum.WRONG_DATE_FORMAT,
	},
	validate(value, helpers) {
		if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
			return { value, errors: helpers.error('date.base') };
		}
		return { value: new Date(value), errors: null };
	},
}));

export default class HelperFunction {
	public date: Date;

	constructor() {
		this.date = new Date();
	}

	async getTimStamp() {
		const time: number = this.date.getTime();
		return time;
	}

	async base64url_decode(data) {
		const buff = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
		return buff.toString('ascii');
	}

	async validate(schema, data) {
		const param = schema.validate(data, { abortEarly: false });
		if (param.error) {
			return param.error.details;
		}
		return param;
	}

	/**
	 * @description Handle custom fields
	 * @param fieldName
	 * @param data
	 */
	async handleCustomField(fieldName, data) {
		if (data[fieldName]) {
			if (data[fieldName] === CompsEnum.TYPE_MY_OWN) {
				data[fieldName] = data[`${fieldName}_custom`] ? data[`${fieldName}_custom`].trim() : '';
			}
			delete data[`${fieldName}_custom`];
		}
	}

	/**
	 * @description function to remove substring from string
	 * @param subData
	 * @param data
	 * @returns
	 */
	async removeSubstring(subData, data) {
		return data.replace(subData, '');
	}

	/**
	 * @description Common function to log error.
	 * @param e
	 */
	async log(attr: ILog) {
		const { message, level, error, location } = attr;
		logger[level]({
			message,
			level,
			meta: {
				error: error.stack ? error.stack : error,
			},
			location, //(file location)
		});
	}

	// /**
	//  *@description Function to log errors.
	//  * @param attribute
	//  */
	// async log(attribute: ILog) {
	// 	const { message, level, error, location } = attribute;

	// 	// Utility to safely convert any value to a string
	// 	const safeStringify = (value: unknown): string => {
	// 		if (typeof value === 'string') return value;
	// 		try {
	// 			// Pretty-print JSON for readability
	// 			return JSON.stringify(value, null, 2);
	// 		} catch {
	// 			// Fallback for circular or unserializable values
	// 			return 'Unserializable value';
	// 		}
	// 	};

	// 	// Log the entry using the appropriate level (e.g., 'info', 'error')
	// 	logger[level]({
	// 		// Ensure the message is always a string
	// 		message: safeStringify(message),

	// 		// Explicit log level
	// 		level,

	// 		// Add error details to meta object, safely formatted
	// 		meta: {
	// 			error:
	// 				error instanceof Error
	// 					? error.stack || error.message // Use stack trace if available
	// 					: safeStringify(error), // Otherwise stringify the error
	// 		},

	// 		// Optional location (e.g., file or module path)
	// 		location,
	// 	});
	// }

	/**
	 * @description Function to return zoning and sub-zoning
	 * @param zoning
	 * @param includeChildren
	 * @param subZoning
	 * @returns
	 */
	getZoning = (
		zoning: string | null = null,
		includeChildren: boolean = false,
		subZoning: string | null = null,
	): Zoning | ZoningValue | string => {
		try {
			// Initialize the main zonings dictionary
			let zonings: Zoning = {
				'': '-- Select Property Type --',
				office: 'Office',
				retail: 'Retail',
				industrial: 'Industrial',
				multi_family: 'Multi-Family',
				hospitality: 'Hospitality',
				special: 'Special',
				residential: 'Residential',
			};

			if (includeChildren) {
				// Define the children for each zoning category
				const children: { [key: string]: ZoningChildren } = {
					office: {
						'': '-- Select a Subtype --',
						medical_office_condo: 'Medical Office Condo',
						medical_office_standalone: 'Medical Office Standalone',
						multi_tenant: 'Multi-Tenant',
						professional_office_condo: 'Professional Office Condo',
						professional_office_standalone: 'Professional Office Standalone',
						'Type My Own': 'Type My Own',
					},
					retail: {
						'': '-- Select a Subtype --',
						bank: 'Bank',
						barcasino_without_kitchen: 'Bar/Casino w/o Kitchen',
						barcasino_with_kitchen: 'Bar/Casino with Kitchen',
						condo: 'Condo',
						c_store: 'C-Store',
						gas_station: 'Gas Station',
						grocery_store: 'Grocery Store',
						multi_tenant: 'Multi-Tenant',
						qsr: 'Quick Serve Restaurant (QSR)',
						regional_mall: 'Regional Mall',
						restaurant: 'Restaurant',
						standalone: 'Standalone',
						strip_center: 'Strip Center',
						'Type My Own': 'Type My Own',
					},
					industrial: {
						'': '-- Select a Subtype --',
						distribution: 'Distribution',
						cold_storage: 'Refrigerated/ Cold Storage',
						warehouse_shop: 'Warehouse/Shop',
						warehouse_shop_with_office: 'Warehouse/Shop with Office',
						warehouse_shop_with_office_retail: 'Warehouse/Shop with Office/Retail',
						'Type My Own': 'Type My Own',
					},
					land: {
						'': '-- Select a Subtype --',
						office: 'Office',
						retail: 'Retail',
						retail_pad: 'Retail Pad',
						industrial: 'Industrial',
						residential: 'Residential',
						multi_family: 'Multifamily',
						other: 'Other',
						ag: 'Agricultural',
						'Type My Own': 'Type My Own',
					},
					multi_family: {
						'': '-- Select a Subtype --',
						'2_4_units': '2-4 Units',
						'4_10_units': '4-10 Units',
						'10_20_units': '10-20 Units',
						'20_100_units': '20-100 Units',
						'100_plus_units': '100+ Units',
						'Type My Own': 'Type My Own',
					},
					hospitality: {
						'': '-- Select a Subtype --',
						bed_and_breakfast: 'Bed and Breakfast',
						hotel: 'Hotel',
						motel: 'Motel',
						'Type My Own': 'Type My Own',
					},
					special: {
						'': '-- Select a Subtype --',
						car_dealerships: 'Car Dealerships',
						car_wash: 'Car Wash',
						church: 'Church',
						golf_course: 'Golf Course',
						green_house: 'Green House',
						hangar: 'Hangar',
						large_animal_vet_clinic: 'Large Animal Vet Clinic',
						mobile_home_park: 'Mobile Home Park',
						nursing_home: 'Nursing Home',
						parking_garge: 'Parking Garage',
						school: 'School',
						self_storage: 'Self-Storage',
						sports_entertainment: 'Sports/Entertainment',
						'Type My Own': 'Type My Own',
					},
					residential: {
						'': '-- Select a Subtype --',
						condo: 'Condo',
						patio: 'Patio',
						ranchette: 'Ranchette',
						single_family: 'Single Family Residence',
						townhome: 'Townhome',
						'Type My Own': 'Type My Own',
					},
				};

				// Initialize a new object to hold zonings with children included
				const newZonings: Zoning = {};

				// Populate newZonings with children if applicable
				for (const [key, value] of Object.entries(zonings)) {
					if (key !== '') {
						newZonings[key] = { name: value as string };
						if (children[key]) {
							(newZonings[key] as { name: string; children?: ZoningChildren }).children =
								children[key];
						}
					}
				}
				zonings = newZonings;
			}

			// Handle the specific zoning and subZoning if provided
			if (zoning) {
				if (includeChildren && subZoning) {
					const selectedZoning = zonings[zoning] as { name: string; children?: ZoningChildren };
					if (selectedZoning.children && selectedZoning.children[subZoning]) {
						return selectedZoning.children[subZoning];
					} else {
						return subZoning;
					}
				} else {
					if (zonings[zoning]) {
						return zonings[zoning];
					} else {
						return zoning.charAt(0).toUpperCase() + zoning.slice(1);
					}
				}
			}

			// Return the entire zonings object if no specific zoning is requested
			return zonings;
		} catch (e) {
			console.error('Error in getZonings function:', e);
			// throw new Error('Unable to get zonings. Please try again later.');
			return e.message || e;
		}
	};
	/**
	 * @description Function to split field.
	 * @param fieldsArray
	 * @returns
	 */
	async splitField(field) {
		const match = field.match(/^(.*?)(\d+)?$/);
		let type = null;

		if (match) {
			let tag = match[1];
			// List of endings to check
			const endingsToRemove = ['_sale_', '_cost_', '_income_', '_zone_', '_'];

			// Iterate through the endings to find a match
			for (const ending of endingsToRemove) {
				if (tag.endsWith(ending)) {
					tag = tag.slice(0, -ending?.length); // Remove the ending
					type = ending.replace(/^_+|_+$/g, ''); // Assign type
					break; // Exit loop once a match is found
				}
			}

			return {
				type,
				tag,
				id: parseInt(match[2], 10),
			};
		} else {
			return {
				tag: field,
				id: null,
				type: null, // Ensure type is included in case of no match
			};
		}
	}
	/**
	 *@description Function to find specific object in array by id
	 * @param arr
	 * @param key
	 * @param value
	 * @returns
	 */
	async searchObject(data, element, value) {
		data.sort((a, b) => a[element] - b[element]);
		let start = 0;
		let end = data?.length - 1;

		while (start <= end) {
			// Find the middle index
			const mid = Math.floor((start + end) / 2);
			const midValue = data[mid][element];
			// Compare mid with given value
			if (midValue === value) {
				return data[mid]; // Object found
			} else if (midValue < value) {
				start = mid + 1;
			} else {
				end = mid - 1;
			}
		}

		return null; // Object not found
	}

	/**
	 * @description Function to get all merge fields tags
	 * @param data
	 */
	async getAllTags(data: string) {
		// Regular expression to find all occurrences of text within {{}}
		const regex = /\{\{(.*?)\}\}/g;

		// Set to hold all unique matches
		const uniqueTags = new Set<string>();

		// Use the regular expression to extract matches
		let match;
		while ((match = regex.exec(data)) !== null) {
			uniqueTags.add(match[1].trim());
		}

		// Convert the Set to an array before returning
		return Array.from(uniqueTags);
	}

	/**
	 * @description Function to replace all merge field tags with values
	 * @param data
	 * @returns
	 */
	async replaceAllTags(data: string, replacements: object) {
		// Regular expression to find all occurrences of text within {{}}
		const regex = /\{\{(.*?)\}\}/g;

		// Replace function to perform the replacement
		data = data.replace(regex, (_, key) => {
			const normalizedKey = key.trim().toLowerCase();
			return replacements[normalizedKey] || `{{${key}}}`; // Keep the tag if no replacement found
		});

		return data;
	}
	/**
	 * @description Function to format currency.
	 * @param amount
	 * @returns
	 */
	async formatCurrency(amount: number): Promise<string> {
		if (amount == null || undefined) {
			amount = 0; // Handle null or undefined case
		}
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2, // Ensures at least 2 decimal places
			maximumFractionDigits: 2, // Ensures no more than 2 decimal places
		});
		return formatter.format(amount);
	}
	/**
	 * Function to format number.
	 * @param value
	 * @returns
	 */
	async formatNumber(value, decimal: number, label: string): Promise<string> {
		try {
			if (value == null || undefined) {
				value = 0; // Handle null
			}

			let labelSpace = ` ${label}`;

			if (label === DownloadCompEnum.PERCENT) {
				labelSpace = `${label}`;
			}
			const formatter =
				value.toLocaleString('en-US', {
					minimumFractionDigits: decimal,
					maximumFractionDigits: decimal,
				}) + labelSpace;

			return formatter;
		} catch (e) {
			return e.message || e;
		}
	}
	/**
	 * @description Function to format decimal numbers.
	 * @param value
	 * @param label
	 * @returns
	 */
	async formatDecimal(value, label: string): Promise<string> {
		try {
			if (value == null || undefined) {
				value = 0; // Handle null or undefined case
			}
			const formattedNum = value.toFixed(2) + label;
			return formattedNum;
		} catch (e) {
			return e.message || e;
		}
	}

	//function to format date to d/m/yyyy format
	async formatDateToMDY(date: Date | string): Promise<string> {
		try {
			if (!date) {
				return AppraisalsEnum.NA;
			}
			const d = new Date(date);
			const month = d.getMonth() + 1; // Months are zero-based, so we add 1.
			const day = d.getDate();
			const year = d.getFullYear();

			// Format month and day to ensure they are always two digits.
			const formattedMonth = month < 10 ? `0${month}` : month;
			const formattedDay = day < 10 ? `0${day}` : day;

			return `${formattedMonth}/${formattedDay}/${year}`;
		} catch (e) {
			return e.message || e;
		}
	}

	async capitalizeFirstLetter(value: string): Promise<string> {
		try {
			let capitalized;
			if (!value) {
				capitalized = AppraisalsEnum.NA;
			} else {
				// converting first letter to uppercase
				capitalized = value.charAt(0).toUpperCase() + value.slice(1);
			}

			return capitalized;
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Helper function to calculate totals
	 * @param items
	 * @param key
	 * @returns
	 */
	async calculateTotal(items: any[] = [], key: string): Promise<number> {
		return items.reduce((sum, item) => sum + (item[key] || 0), 0);
	}

	/**
	 * @description Extracts text from a PDF file
	 */
	public async extractTextFromPdf(pdfPath: string): Promise<string> {
		try {
			const dataBuffer = fs.readFileSync(pdfPath);
			const data = await pdf(dataBuffer);
			fs.unlinkSync(pdfPath); // Delete the file after reading
			return data.text;
		} catch (error) {
			fs.unlinkSync(pdfPath); // Delete the file after reading
			console.error('Error extracting text from PDF:', error);
			return '';
		}
	}
	/**
	 * @description Function to format string.
	 * @param value
	 * @returns
	 */
	public async formatString(value: string) {
		try {
			if (value.includes('_')) {
				return value
					.replace(/_/g, ' ') // Replace underscores with spaces
					.split(' ') // Split into words
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
					.join(' '); // Join words back into a string
			} else {
				return value.charAt(0).toUpperCase() + value.slice(1); // Capitalize only the first letter
			}
		} catch (e) {
			return e.message || e;
		}
	}
}
