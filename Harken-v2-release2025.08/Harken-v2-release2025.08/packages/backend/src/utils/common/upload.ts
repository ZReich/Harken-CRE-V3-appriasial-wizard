import fs from 'fs';
import { S3 } from 'aws-sdk';
import { S3_REGION, S3_PUBLIC_KEY, S3_PRIVATE_KEY, S3_BUCKET } from '../../env';
import Joi from 'joi';
import ErrorMessageEnum from '../enums/ErrorMessageEnum';
import { Timestamp } from './Time';
import { LoggerEnum, UploadEnum } from '../enums/DefaultEnum';
import { ImagesEnum, ImagesPageEnum, ImagesTitleEnum } from '../enums/AppraisalsEnum';
import { ImageType } from '../../services/appraisalFiles/IAppraisalFilesService';
import HelperFunction from './helper';
import { IAddFile, IUploadToS3 } from '../../services/uploadFiles/IUploadService';
import axios from 'axios';

const helperFunction = new HelperFunction();

const s3 = new S3({
	region: S3_REGION, // Replace 'your-bucket-region' with your bucket's region
	credentials: {
		accessKeyId: S3_PUBLIC_KEY, // Replace with your AWS access key ID
		secretAccessKey: S3_PRIVATE_KEY, // Replace with your AWS secret access key
	},
});
const bucketName = S3_BUCKET;

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

export default class UploadFunction {
	constructor() {}

	/**
	 * @description function to upload files on s3 bucket
	 * @param fileInput
	 * @param entityName
	 * @param objectId
	 * @returns
	 */
	public async uploadToS3(attributes: Partial<IUploadToS3>) {
		try {
			const { fileInput, entityName = UploadEnum.GENERAL, objectId } = attributes;
			const filename = fileInput.originalname.replace(/\s/g, ''); // Remove spaces from filename
			const sourceImg = fs.readFileSync(fileInput.path);

			if (sourceImg) {
				const dir = await this.getServerDirectory(filename, entityName, objectId);
				const uploadParams: S3.Types.PutObjectRequest = {
					Bucket: bucketName,
					Key: dir,
					Body: sourceImg,
					ContentType: fileInput.mimetype,
				};

				await s3.upload(uploadParams).promise();
				fs.unlinkSync(fileInput.path); // Remove the temporary file after upload
				return dir;
			}
			return null;
		} catch (error) {
			console.error('Error uploading file to S3:', error);
			return null;
		}
	}

	/**
	 * @description function to remove file from s3 bucket
	 * @param dir
	 * @returns
	 */
	public async removeFromServer(dir: string | null) {
		try {
			if (dir) {
				await s3.deleteObject({ Bucket: bucketName, Key: dir }).promise();
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error removing file from server:', error);
			return false;
		}
	}

	/**
	 * @description function to get server directory path
	 * @param fileName
	 * @param extension
	 * @param entity
	 * @param objectId
	 * @returns
	 */
	public async getServerDirectory(
		fileName: string,
		entity: string = UploadEnum.GENERAL,
		objectId: number,
	) {
		let dir = entity + '/';

		if (objectId) {
			dir = dir + objectId + '/';
		}
		const extension = fileName.split('.').pop();
		fileName = fileName.split('.')[0];

		const uniqueFilename = `${fileName}_${Timestamp(new Date())}.${extension}`;
		return dir + uniqueFilename;
	}

	/**
	 * @description Function to get image type title and page
	 * @param type
	 * @returns
	 */
	async getImageTypes(type?: string): Promise<Record<string, ImageType>> {
		const list: Record<string, ImageType> = {
			cover: {
				title: ImagesTitleEnum.SUB_PROPERTY,
				orientation: ImagesEnum.HORIZONTAL,
				page: ImagesPageEnum.COVER_PHOTO,
			},
			'table-of-contents': {
				title: ImagesTitleEnum.SUB_PROPERTY_2,
				orientation: ImagesEnum.VERTICAL,
				page: ImagesPageEnum.TABLE_OF_CONTENTS,
			},
			'executive-summary-details': {
				title: ImagesTitleEnum.SUB_PROPERTY_3,
				orientation: ImagesEnum.VERTICAL,
				page: ImagesPageEnum.EXECUTIVE_SUMMARY,
			},
			'property-summary-top-image': {
				title: ImagesTitleEnum.SUB_PROPERTY_4,
				orientation: ImagesEnum.HORIZONTAL,
				page: ImagesPageEnum.PROPERTY_SUMMARY,
			},
			'property-summary-bottom-image': {
				title: ImagesTitleEnum.SUB_PROPERTY_5,
				orientation: ImagesEnum.HORIZONTAL,
				page: ImagesPageEnum.PROPERTY_SUMMARY,
			},
			'sub-property-1': {
				title: ImagesTitleEnum.SUB_PROPERTY_6,
				orientation: ImagesEnum.HORIZONTAL,
				page: 16,
			},
			'sub-property-2': {
				title: ImagesTitleEnum.SUB_PROPERTY_7,
				orientation: ImagesEnum.HORIZONTAL,
				page: 16,
			},
			'sub-property-3': {
				title: ImagesTitleEnum.SUB_PROPERTY_8,
				orientation: ImagesEnum.HORIZONTAL,
				page: 16,
			},
			'extra-image': {
				title: ImagesTitleEnum.ADDITIONAL_IMAGE,
				description: ImagesPageEnum.EXTRA_IMAGE,
			},
		};

		if (type && list[type]) {
			return { [type]: list[type] };
		}
		return list;
	}

	// Add file from server
	public async addFile(attributes: Partial<IAddFile>) {
		try {
			const { file, type, id } = attributes;
			if (file) {
				// Perform S3 upload
				const filename = await this.uploadToS3({ fileInput: file, entityName: type, objectId: id });

				if (filename) {
					return filename;
				}
				return false;
			}
		} catch (error) {
			console.error('Error adding property image:', error);
			//logging error
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			return '';
		}
	}

	/**
	 * Upload map boundary to s3 bucket.
	 * @param mapImageUrl
	 * @returns
	 */
	public async uploadMapBoundary(mapImageUrl: string, existingFileKey?: string, fileName?: string): Promise<string> {
		try {
			// Step 1: Delete old image from S3 if key is provided
			if (existingFileKey) {
				s3.deleteObject({
					Bucket: bucketName,
					Key: existingFileKey,
				}).promise();
			}

			// Step 2: Download and upload new image
			const imageResponse = await axios.get(mapImageUrl, {
				responseType: 'arraybuffer',
			});
			const buffer = Buffer.from(imageResponse.data, 'binary');

			await s3.upload({
					Bucket: bucketName,
					Key: fileName,
					Body: buffer,
					ContentType: 'image/png',
					ACL: 'public-read',
				}).promise();

			// Step 3: Return new S3 URL
			return fileName;
		} catch (error) {
			console.error('Error uploading map boundary', error);
			await helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			return mapImageUrl;
		}
	}
}
