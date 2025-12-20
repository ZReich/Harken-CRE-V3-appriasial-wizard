import database from '../../config/db';
import { IEvaluationFiles } from '../evaluations/IEvaluationsService';
import { IEvaluationFilesData, IFilesPosition } from './IEvaluationFilesService';
const EvaluationFiles = database.evaluation_files;

export default class EvaluationFilesStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('EvaluationFilesStore', EvaluationFiles);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to create evaluation file
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async create(attributes: Partial<IEvaluationFilesData>): Promise<IEvaluationFilesData> {
		try {
			return await EvaluationFiles.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description function to update evaluation file
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async update(attributes: Partial<IEvaluationFilesData>): Promise<IEvaluationFilesData> {
		try {
			const { id, ...rest } = attributes;
			return await EvaluationFiles.update(rest, { where: { id } });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Find evaluation files by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findFilesByAttribute(
		attributes: Partial<IEvaluationFilesData>,
	): Promise<IEvaluationFilesData> {
		try {
			return await EvaluationFiles.findOne({ where: attributes });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Function to remove file record by id
	 * @param id
	 * @returns
	 */
	public async removeFilesById(id: number) {
		try {
			return await EvaluationFiles.destroy({
				where: { id },
			});
		} catch (e) {
			return e.message || e;
		}
	}
	/**
	 * @description Function to find all files by attributes
	 * @param attributes
	 * @returns
	 */
	public async findFiles(attributes: Partial<IEvaluationFiles>): Promise<IEvaluationFiles[]> {
		try {
			return await EvaluationFiles.findAll({
				where: attributes,
				order: [['order', 'ASC']],
				raw: true,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description function to update evaluation file order and name
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async updateEvaluationFiles(attributes: Partial<IFilesPosition>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await EvaluationFiles.update(rest, { where: { id } });
		} catch (e) {
			return false;
		}
	}
}
