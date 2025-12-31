import database from '../../config/db';
import { IEvalPhotoPage, IEvaluationPhotoPages } from './IResEvaluationPhotoPagesService';
const EvaluationPhotoPages = database.res_evaluation_photo_pages;
const Evaluations = database.res_evaluations;
export default class EvaluationPhotoPagesStorage {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description Find Evaluation photo pages by id.
	 * @param attributes
	 * @returns
	 */
	public async find(
		photoAttributes: Partial<IEvaluationPhotoPages>,
	): Promise<IEvaluationPhotoPages> {
		try {
			return await EvaluationPhotoPages.findOne(
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
	 * @description Update Evaluation photo pages
	 * @param id
	 * @param attributes
	 * @returns
	 */
	public async update(attributes: Partial<IEvalPhotoPage>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await EvaluationPhotoPages.update(rest, {
				where: {
					id,
				},
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Create Evaluation photo pages
	 * @param attributes
	 * @returns
	 */
	public async create(attributes: Partial<IEvalPhotoPage>): Promise<IEvalPhotoPage> {
		try {
			return await EvaluationPhotoPages.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to find all photo pages.
	 * @param attributes
	 * @returns
	 */
	public async findOne(photoAttributes: Partial<IEvalPhotoPage>): Promise<IEvaluationPhotoPages> {
		try {
			const getPhotos = await Evaluations.findOne({
				where: photoAttributes,
				attributes: ['photos_taken_by', 'photo_date'], // Only the fields you need
				include: [
					{
						model: EvaluationPhotoPages,
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
	public async delete(attributes: Partial<IEvalPhotoPage>): Promise<IEvalPhotoPage> {
		try {
			const { id } = attributes;
			return await EvaluationPhotoPages.destroy({
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
	public async findAll(attributes: Partial<IEvalPhotoPage>): Promise<IEvalPhotoPage[]> {
		try {
			const getPhotos = await EvaluationPhotoPages.findAll({
				where: attributes,
			});
			return getPhotos;
		} catch (e) {
			return e.message || e;
		}
	}
}
