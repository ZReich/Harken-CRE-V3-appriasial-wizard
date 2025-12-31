import { Router } from 'express';
import EvaluationsService from '../services/evaluations/evaluations.service';
import multer from 'multer';
import { handleMulterError, validateFormData } from '../middleware/common';
import { MAX_IMAGE_MB } from '../env';

const upload = multer({
	dest: 'uploads/',
	limits: {
		fileSize: MAX_IMAGE_MB * 1024 * 1024,
	},
});
// Set up Multer for file uploads
const uploadPhoto = multer({ dest: 'uploads/' });

// Set up Multer for file uploads with size limit and file type
const uploadImage = multer({
	dest: 'uploads/',
	limits: {
		fileSize: MAX_IMAGE_MB * 1024 * 1024,
	},
	fileFilter: (req, file, cb) => {
		const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true); // Accept the file
		} else {
			cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.')); // Reject the file with an error
		}
	},
});
class EvaluationsRoutes {
	router = Router();
	public evaluations = new EvaluationsService();
	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		// Update evaluation overview
		this.router.patch('/update-overview/:id', this.evaluations.updateOverview);

		// update map boundaries in evaluation.
		this.router.patch('/update-map-boundary/:id', this.evaluations.updateMapBoundary);

		// update aerial map in evaluation.
		this.router.patch('/update-aerial-map/:id', this.evaluations.updateAerialMap);

		// Get evaluation by id
		this.router.get('/get/:id', this.evaluations.getEvaluation);

		// Delete evaluation by id
		this.router.delete('/delete/:id', this.evaluations.deleteEvaluation);

		// Upload evaluations photo pages
		this.router.post('/upload-photo-pages/:id', this.evaluations.uploadPhotoPages);

		// Get all evaluations photo pages
		this.router.get('/get-photo-pages/:id', this.evaluations.getAllPhotoPages);

		// Upload multiple photos
		this.router.post(
			'/upload-photos',
			uploadPhoto.array('files'),
			validateFormData,
			this.evaluations.uploadMultiplePhotos,
		);

		// Upload Evaluation Images
		this.router.post(
			'/upload-image/:id',
			uploadImage.single('file'),
			validateFormData,
			this.evaluations.uploadImage,
		);
		// Update area info in evaluation
		this.router.post('/update-area-info/:id', this.evaluations.updateAreaInfo);

		// Get area info of evaluation
		this.router.get('/get-area-info/:id', this.evaluations.getAreaInfo);

		// Get evaluation list
		this.router.post('/list', this.evaluations.getEvaluationList);

		// Delete evaluation image
		this.router.delete('/remove-image', this.evaluations.removeImage);

		// Upload exhibits
		this.router.post(
			'/upload-exhibits/:id',
			upload.single('file'),
			validateFormData,
			this.evaluations.evaluationExhibits,
			handleMulterError, // Error handling middleware for multer
		);
		// Update exhibit's position
		this.router.patch('/update-exhibit/:id', this.evaluations.updateExhibit);

		// Delete evaluation image
		this.router.delete('/remove-exhibit/:id', this.evaluations.removeExhibit);

		// Get evaluations images by id
		this.router.get('/get-files/:id', this.evaluations.getEvaluationFiles);

		// Update evaluation position
		this.router.patch('/update-position/:id', this.evaluations.updatePosition);

		// Update positions of exhibits of evaluation
		this.router.patch('/update-exhibit-position/:id', this.evaluations.updateExhibitsPositions);

		// Save income approach data by evaluation id
		this.router.post('/save-income-approach', this.evaluations.saveIncomeApproachDetails);

		// Get evaluation income approach
		this.router.get('/income-approach', this.evaluations.getIncomeApproach);

		// Get selected comps for sale approach
		this.router.post('/get-selected-comps', this.evaluations.getSelectedComps);

		// Save evaluation sales approach data
		this.router.post('/save-sales-approach', this.evaluations.saveSalesApproach);

		// Update evaluation sales approach data
		this.router.post('/update-sales-approach', this.evaluations.saveSalesApproach);

		// Get evaluation sales approach
		this.router.get('/get-sales-approach', this.evaluations.getSalesApproach);

		// get comparative attributes
		this.router.get('/comparative-attributes', this.evaluations.getEvalComparativeAttributes);

		// Save evaluation sales approach area map
		this.router.patch('/save-sale-area-map/:id', this.evaluations.saveAreaMap);

		// Save evaluations cost approach data
		this.router.post('/save-cost-approach', this.evaluations.saveCostApproachLand);

		// Get evaluations cost approach data
		this.router.get('/get-cost-approach', this.evaluations.getCostApproach);

		// Update evaluations cost approach data
		this.router.post('/update-cost-approach', this.evaluations.saveCostApproachLand);

		// Save evaluations cost approach improvements
		this.router.post(
			'/save-cost-approach-Improvements',
			this.evaluations.saveCostApproachImprovements,
		);

		// Save evaluations cost approach area map
		this.router.patch('/save-cost-area-map/:id', this.evaluations.saveAreaMap);

		/*To check evaluations is linked with comps in approach (sale, cost),
		when trying to change comparison basis from overview using evaluation id.*/
		this.router.get('/check-linked-comps/:id', this.evaluations.checkLinkedComps);

		// Save evaluation lease approach data
		this.router.post('/save-lease-approach', this.evaluations.saveLeaseApproach);

		// Update evaluation lease approach data
		this.router.post('/update-lease-approach', this.evaluations.saveLeaseApproach);

		// Get evaluation lease approach
		this.router.get('/get-lease-approach', this.evaluations.getLeaseApproach);

		// Save evaluation lease approach area map
		this.router.patch('/save-lease-area-map/:id', this.evaluations.saveAreaMap);

		// Save and update rent roll
		this.router.post('/save-rent-roll', this.evaluations.saveRentRoll);

		// Save and update rent roll type
		this.router.post('/update-rent-roll/:rentRollTypeid', this.evaluations.saveRentRoll);

		// Get rent roll for specific evaluations
		this.router.get('/get-rent-roll', this.evaluations.getRentRolls);

		// Save cap approach data
		this.router.post('/save-cap-approach', this.evaluations.saveCapApproach);

		// Update cap approach data
		this.router.post('/update-cap-approach', this.evaluations.saveCapApproach);

		// Get evaluation cap approach
		this.router.get('/get-cap-approach', this.evaluations.getCapApproach);

		// Save evaluation cap approach area map
		this.router.patch('/save-cap-area-map/:id', this.evaluations.saveAreaMap);

		// Save evaluations multi-family approach data
		this.router.post('/save-multi-family-approach', this.evaluations.saveMultiFamily);

		// Update evaluation multi-family approach data
		this.router.post('/update-multi-family-approach', this.evaluations.saveMultiFamily);
		// Get evaluation multi-family approach
		this.router.get('/get-multi-family-approach', this.evaluations.getMultiFamilyApproach);

		// Save evaluation multi-family approach area map
		this.router.patch('/save-multi-family-area-map/:id', this.evaluations.saveAreaMap);

		// Save weighted_market_value and percentage of approaches
		this.router.patch('/save-weight-percent/:id', this.evaluations.saveWeightPercentage);

		// Get HTML data for preview
		this.router.get('/report-preview/:id', this.evaluations.previewReport);

		// Save evaluation scenario
		this.router.post('/save-setup', this.evaluations.saveSetup);
		// Update evaluation scenario
		this.router.post('/update-setup/:id', this.evaluations.saveSetup);

		// Save review details in evaluations
		this.router.patch('/save-review/:id', this.evaluations.saveReviewDetails);

		// Get review details by id
		this.router.get('/get-review/:id', this.evaluations.getReview);

		// Get merge fields data
		this.router.post('/merge-field-data', this.evaluations.getMergeFieldData);
	}
}

export default new EvaluationsRoutes().router;
