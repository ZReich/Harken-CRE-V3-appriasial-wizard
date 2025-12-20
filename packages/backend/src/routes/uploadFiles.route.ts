import { Router } from 'express';
import UploadFileService from '../services/uploadFiles/uploadFile.service';
import multer from 'multer';
import { validateFormData } from '../middleware/common';

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

class UploadFilesRoutes {
	router = Router();
	public upload = new UploadFileService();

	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		// Upload Files
		this.router.post('/upload', upload.single('file'), validateFormData, this.upload.uploadFile);

		// Remove Files from s3 bucket
		this.router.delete('/delete', this.upload.delete);

		// Upload multiple photos
		this.router.post(
			'/upload-multiple-photos',
			upload.array('files'),
			validateFormData,
			this.upload.uploadMultiplePhotos,
		);
	}
}

export default new UploadFilesRoutes().router;
