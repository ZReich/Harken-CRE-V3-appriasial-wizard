import database from '../../config/db';
import { IAppraisalPhotoPages, IPhotoPage } from './IAppraisalPhotoPagesService';
const AppraisalPhotoPages = database.appraisal_photo_pages;
const Appraisals = database.appraisals;
export default class AppraisalPhotoPagesStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Find Appraisal photo pages by id.
	 * @param attributes
	 * @returns
	 */
	public async find(photoAttributes: Partial<IAppraisalPhotoPages>): Promise<IAppraisalPhotoPages> {
		try {
			return await AppraisalPhotoPages.findOne(
				{ where: photoAttributes },
				{
					attributes: ['id', 'image_url', 'caption', 'order'],
				},
			);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Update appraisal photo pages
	 * @param id
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<IPhotoPage>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalPhotoPages.update(rest, {
				where: {
					id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Create appraisal photo pages
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IPhotoPage>): Promise<IPhotoPage> {
		try {
			return await AppraisalPhotoPages.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to find all photo pages.
	 * @param attributes
	 * @returns
	 */
	public async findOne(photoAttributes: Partial<IPhotoPage>): Promise<IAppraisalPhotoPages> {
		try {
			const getPhotos = await Appraisals.findOne({
				where: photoAttributes,
				attributes: ['photos_taken_by', 'photo_date'], // Only the fields you need
				include: [
					{
						model: AppraisalPhotoPages,
						attributes: ['id', 'image_url', 'caption', 'order'],
						as: 'photos',
					},
				],
				order: [['photos', 'order', 'asc']],
			});
			return getPhotos;
		} catch (e) {
			return e.message || e;
		}
	}
	/**
	 * @description Function to delete photos by id.
	 * @param attributes
	 * @returns
	 */
	public async delete(attributes: Partial<IPhotoPage>): Promise<IPhotoPage> {
		try {
			const { id } = attributes;
			return await AppraisalPhotoPages.destroy({
				where: {
					id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}
	/**
	 * @description Function to get all photo pages according to attributes.
	 * @param photoAttributes
	 * @returns
	 */
	public async findAll(attributes: Partial<IPhotoPage>): Promise<IPhotoPage[]> {
		try {
			const getPhotos = await AppraisalPhotoPages.findAll({
				where: attributes,
			});
			return getPhotos;
		} catch (e) {
			return e.message || e;
		}
	}
}
