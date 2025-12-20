import { Router } from 'express';
import ResEvaluationsService from '../services/resEvaluations/resEvaluations.service';
import multer from 'multer';
import { handleMulterError, validateFormData } from '../middleware/common';
import { MAX_IMAGE_MB } from '../env';

const upload = multer({
	dest: 'uploads/',
	limits: {
		fileSize: MAX_IMAGE_MB * 1024 * 1024,
	},
});
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
class ResEvaluationsRoutes {
	router = Router();
	public resEvaluations = new ResEvaluationsService();
	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		// Save evaluation scenario
		this.router.post('/save-setup', this.resEvaluations.saveSetup);
		// Update evaluation scenario
		this.router.post('/update-setup/:id', this.resEvaluations.saveSetup);
		// Get evaluation by id
		this.router.get('/get/:id', this.resEvaluations.getEvaluation);
		// Update evaluation overview
		this.router.patch('/update-overview/:id', this.resEvaluations.updateOverview);
		// update map boundaries in evaluation.
		this.router.patch('/update-map-boundary/:id', this.resEvaluations.updateMapBoundary);
		// update aerial map in evaluation.
		this.router.patch('/update-aerial-map/:id', this.resEvaluations.updateAerialMap);
		// Update area info in evaluation
		this.router.post('/update-area-info/:id', this.resEvaluations.updateAreaInfo);
		// Get area info of evaluation
		this.router.get('/get-area-info/:id', this.resEvaluations.getAreaInfo);
		// Upload evaluations photo pages
		this.router.post('/save-photo-pages/:id', this.resEvaluations.savePhotoPages);
		// Get all evaluations photo pages
		this.router.get('/get-photo-pages/:id', this.resEvaluations.getAllPhotoPages);
		// Upload Evaluation Images
		this.router.post(
			'/upload-image/:id',
			uploadImage.single('file'),
			validateFormData,
			this.resEvaluations.uploadImage,
		);
		// Delete evaluation image
		this.router.delete('/remove-image', this.resEvaluations.removeImage);
		// Get evaluations images by id
		this.router.get('/get-files/:id', this.resEvaluations.getEvaluationFiles);
		// Get evaluation list
		this.router.post('/list', this.resEvaluations.getList);
		// Delete evaluation by id
		this.router.delete('/delete/:id', this.resEvaluations.delete);
		// Save and update income approach data by evaluation id
		this.router.post('/save-income-approach', this.resEvaluations.saveIncomeApproach);

		// Get evaluation income approach
		this.router.get('/income-approach', this.resEvaluations.getIncomeApproach);

		// Save evaluations cost approach data
		this.router.post('/save-cost-approach', this.resEvaluations.saveCostApproach);

		// Get evaluations cost approach data
		this.router.get('/get-cost-approach', this.resEvaluations.getCostApproach);

		// Update evaluations cost approach data
		this.router.post('/update-cost-approach', this.resEvaluations.saveCostApproach);

		// Save evaluations cost approach improvements
		this.router.post(
			'/save-cost-approach-Improvements',
			this.resEvaluations.saveCostApproachImprovements,
		);

		// Save evaluations cost approach area map
		this.router.patch('/save-cost-area-map/:id', this.resEvaluations.saveAreaMap);

		// Get selected comps for sale approach
		this.router.post('/get-selected-comps', this.resEvaluations.getSelectedComps);

		// Update evaluation position
		this.router.patch('/update-position/:id', this.resEvaluations.updatePosition);

		// Upload exhibits
		this.router.post(
			'/upload-exhibits/:id',
			upload.single('file'),
			validateFormData,
			this.resEvaluations.evaluationExhibits,
			handleMulterError, // Error handling middleware for multer
		);
		// Update exhibit's position
		this.router.patch('/update-exhibit/:id', this.resEvaluations.updateExhibit);

		// Delete evaluation image
		this.router.delete('/remove-exhibit/:id', this.resEvaluations.removeExhibit);

		// Update positions of exhibits of evaluation
		this.router.patch('/update-exhibit-position/:id', this.resEvaluations.updateExhibitsPositions);

		// Save evaluation sales approach data
		this.router.post('/save-sales-approach', this.resEvaluations.saveSalesApproach);

		// Save evaluation sales approach data
		this.router.post('/update-sales-approach', this.resEvaluations.saveSalesApproach);

		// Get evaluation sales approach
		this.router.get('/get-sales-approach', this.resEvaluations.getSalesApproach);

		// Save evaluation sales approach area map
		this.router.patch('/save-sale-area-map/:id', this.resEvaluations.saveAreaMap);

		// get comparative attributes
		this.router.get('/comparative-attributes', this.resEvaluations.getEvalComparativeAttributes);

		// Save weighted_market_value and percentage of approaches
		this.router.patch('/save-weight-percent/:id', this.resEvaluations.saveWeightPercentage);

		// Save review details in evaluations
		this.router.patch('/save-review/:id', this.resEvaluations.saveReviewDetails);

		// Get review details by id
		this.router.get('/get-review/:id', this.resEvaluations.getReview);

		// Get HTML data for preview
		this.router.get('/report-preview/:id', this.resEvaluations.previewReport);

		// Get merge fields data
		this.router.post('/merge-field-data', this.resEvaluations.getMergeFieldData);
	}
}

export default new ResEvaluationsRoutes().router;
