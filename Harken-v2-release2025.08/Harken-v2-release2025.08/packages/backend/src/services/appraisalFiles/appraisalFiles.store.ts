import AppraisalsEnum from '../../utils/enums/AppraisalsEnum';
import database from '../../config/db';
import { IAppraisalFiles } from '../appraisals/IAppraisalsService';
import { IAppraisalFilesData, IFilesPosition } from './IAppraisalFilesService';
const AppraisalFiles = database.appraisal_files;

export default class AppraisalFilesStore {
	public static OPERATION_UNSUCCESSFUL = class extends Error {
		constructor() {
			console.log('AppraisalFilesStore', AppraisalFiles);
			super('An error occurred while processing the request.');
		}
	};

	/**
	 * @description function to create appraisal file
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async create(attributes: Partial<IAppraisalFilesData>): Promise<IAppraisalFilesData> {
		try {
			return await AppraisalFiles.create(attributes);
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description function to update appraisal file
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async update(attributes: Partial<IAppraisalFilesData>): Promise<IAppraisalFilesData> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalFiles.update(rest, { where: { id } });
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description Find appraisal files by attribute.
	 * @param attributes
	 * @returns
	 */
	public async findFilesByAttribute(
		attributes: Partial<IAppraisalFilesData>,
	): Promise<IAppraisalFilesData> {
		try {
			return await AppraisalFiles.findOne({ where: attributes });
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
			return await AppraisalFiles.destroy({
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
	public async findFiles(attributes: Partial<IAppraisalFiles>): Promise<IAppraisalFiles[]> {
		try {
			return await AppraisalFiles.findAll({
				where: attributes,
				order: [[AppraisalsEnum.ORDER_BY_COLUMN, 'ASC']],
				raw: true,
			});
		} catch (e) {
			return e.message || e;
		}
	}

	/**
	 * @description function to update appraisal file order and name
	 * @param attributes
	 * @param file
	 * @returns
	 */
	public async updateAppraisalFiles(attributes: Partial<IFilesPosition>): Promise<boolean> {
		try {
			const { id, ...rest } = attributes;
			return await AppraisalFiles.update(rest, { where: { id } });
		} catch (e) {
			return false;
		}
	}
}
