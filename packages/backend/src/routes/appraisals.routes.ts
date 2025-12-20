import { Router } from 'express';
import AppraisalsService from '../services/appraisals/appraisals.service';
import AppraisalAIService from '../services/appraisal/appraisal-ai.service';
import multer from 'multer';
import { MAX_IMAGE_MB } from '../env';
import { handleMulterError, validateFormData } from '../middleware/common';

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
class AppraisalsRoutes {
	router = Router();
	public appraisals = new AppraisalsService();
	public appraisalAI = new AppraisalAIService();
	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		// save appraisal details
		this.router.post('/save-setup', this.appraisals.appraisalSetupSave);

		// Update appraisal overview
		this.router.patch('/update-overview/:id', this.appraisals.updateOverview);

		// update appraisal setup details
		this.router.patch('/update-setup/:id', this.appraisals.appraisalSetupSave);

		// update map boundaries in appraisal.
		this.router.patch('/update-map-boundary/:id', this.appraisals.updateMapBoundary);

		// Upload Appraisal Images
		this.router.post(
			'/upload-image/:id',
			uploadImage.single('file'),
			validateFormData,
			this.appraisals.uploadImage,
		);

		// update aerial map in appraisal.
		this.router.patch('/update-aerial-map/:id', this.appraisals.updateAerialMap);

		// Update area info in appraisal
		this.router.post('/update-areainfo/:id', this.appraisals.updateAreaInfo);

		// Delete appraisal image
		this.router.delete('/remove-image', this.appraisals.removeImage);

		// Upload exhibits
		this.router.post(
			'/post-exhibits/:id',
			upload.single('file'),
			validateFormData,
			this.appraisals.postExhibits,
			handleMulterError, // Error handling middleware for multer
		);

		// Delete appraisal image
		this.router.delete('/remove-exhibit/:id', this.appraisals.removeExhibit);

		// Get appraisal by id
		this.router.get('/get/:id', this.appraisals.getAppraisal);

		// Get appraisal images by id
		this.router.get('/get-files/:id', this.appraisals.getAppraisalFiles);

		// Update exhibit's position
		this.router.patch('/update-exhibit/:id', this.appraisals.updateExhibit);

		// Save and update  income approach data by appraisal id
		this.router.post('/save-income-approach', this.appraisals.saveIncomeApproachDetails);

		// Get appraisal list
		this.router.post('/list', this.appraisals.getAppraisalList);

		// Get appraisal income approach
		this.router.get('/income-approach', this.appraisals.getAppraisalIncomeApproach);

		// Get area info of appraisal
		this.router.get('/get-areaInfo/:id', this.appraisals.getAreaInfo);

		// Advanced search for comps in appraisal approaches
		this.router.post('/advance-filter', this.appraisals.advancedFiltersForApproaches);

		// Get selected comps for sale approach
		this.router.post('/get-selected-comps', this.appraisals.getSelectedComps);

		// Save appraisal sales approach data
		this.router.post('/save-sales-approach', this.appraisals.saveSalesApproach);

		// Get appraisal sales approach
		this.router.get('/get-sales-approach', this.appraisals.getSalesApproach);

		// Update appraisal sales approach data
		this.router.post('/update-sales-approach', this.appraisals.saveSalesApproach);

		// Save appraisal cost approach data
		this.router.post('/save-cost-approach', this.appraisals.saveCostApproachLand);

		// Get appraisal cost approach data
		this.router.get('/get-cost-approach', this.appraisals.getCostApproach);

		// Delete appraisal by id
		this.router.delete('/delete-appraisal/:id', this.appraisals.deleteAppraisal);

		// Update appraisal cost approach data
		this.router.post('/update-cost-approach', this.appraisals.saveCostApproachLand);

		// Save appraisal cost approach improvements
		this.router.post(
			'/save-cost-approach-Improvements',
			this.appraisals.saveCostApproachImprovements,
		);

		// Save appraisal cost approach area map
		this.router.patch('/save-cost-area-map/:id', this.appraisals.saveAreaMap);

		// Save appraisal sales approach area map
		this.router.patch('/save-sale-area-map/:id', this.appraisals.saveAreaMap);

		// Get data for pdf
		this.router.get('/download-report/:id', this.appraisals.generateAppraisalReport);

		// Update positions of exhibits of appraisal
		this.router.patch('/update-positions/:id', this.appraisals.updateExhibitsPositions);

		// To link existing template to create template for report
		this.router.post('/link-template', this.appraisals.linkExistedTemplate);

		// Get HTML data for preview
		this.router.get('/report-preview/:id', this.appraisals.previewReport);

		/*To check appraisal is linked with comps in approach (sale, cost),
		when trying to change comparison basis from overview using appraisal id.*/
		this.router.get('/check-linked-comps/:id', this.appraisals.checkLinkedComps);

		// Get appraisal income approach html
		this.router.get('/income-approach-html', this.appraisals.getIncomeApproachHTML);

		// Get appraisal sales approach html
		this.router.get('/sale-approach-html', this.appraisals.getSalesApproachHTML);

		// Get appraisal cost approach html
		this.router.get('/cost-approach-html', this.appraisals.getCostApproachHTML);

		// Update appraisal position
		this.router.patch('/update-position/:id', this.appraisals.updatePosition);

		// Get merge fields data from html content
		this.router.post('/convert-editor-data/:id', this.appraisals.covertEditorData);

		// Upload Appraisal photo pages
		this.router.post('/upload-photo-pages/:id', this.appraisals.uploadPhotoPages);

		// Get all Appraisal photo pages
		this.router.get('/get-photo-pages/:id', this.appraisals.getAllPhotoPages);

		// Save appraisal lease approach data
		this.router.post('/save-lease-approach', this.appraisals.saveLeaseApproach);

		// Get appraisal lease approach
		this.router.get('/get-lease-approach', this.appraisals.getLeaseApproach);

		// Update appraisal lease approach data
		this.router.post('/update-lease-approach', this.appraisals.saveLeaseApproach);
		// Upload multiple photos
		this.router.post(
			'/upload-photos',
			uploadPhoto.array('files'),
			validateFormData,
			this.appraisals.uploadMultiplePhotos,
		);

		// Get appraisal lease approach html
		this.router.get('/lease-approach-html', this.appraisals.getLeaseApproachHTML);

		// Save appraisal lease approach area map
		this.router.patch('/save-lease-area-map/:id', this.appraisals.saveAreaMap);
		// get sale approach comparative attributes
		this.router.get(
			'/sale-comparative-attributes',
			this.appraisals.getAllSaleComparativeAttributes,
		);

		// Get appraisal income comparison approach preview
		this.router.get('/income-comparison-html', this.appraisals.getIncomeComparisonHTML);

		// Save and update rent roll
		this.router.post('/save-rent-roll', this.appraisals.saveRentRoll);

		// Save and update rent roll
		this.router.post('/update-rent-roll/:rentRollTypeid', this.appraisals.saveRentRoll);

		// Get rent roll for specific appraisal
		this.router.get('/get-rent-roll', this.appraisals.getRentRolls);

		// Get appraisal rent roll approach preview
		this.router.get('/rent-roll-html', this.appraisals.getRentRollComponentHTML);

		// AI Draft Generation
		this.router.post('/ai-draft', this.appraisalAI.generateDraft);
	}
}

export default new AppraisalsRoutes().router;
