import { Router } from 'express';
import CompsService from '../services/comps/comps.service';
import compsMapRoutes from './compsMap.routes';
import multer from 'multer';

const upload = multer({
	dest: 'uploads/',
});
class CompsRoutes {
	router = Router();
	public comps = new CompsService();

	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		// Map-related routes
		this.router.use('/map', compsMapRoutes);
		
		// Get comps
		this.router.post('/list', this.comps.compsList);
		// Create comps
		this.router.post('/create', this.comps.saveComp);
		// Get comp
		this.router.get('/get/:id', this.comps.getCompById);
		// Update comp
		this.router.patch('/update/:id', this.comps.saveComp);
		// Delete comp
		this.router.delete('/delete/:id', this.comps.delete);
		// Get cities
		this.router.get('/cities', this.comps.getCities);
		// Get comp
		this.router.post('/download-comp-pdf', this.comps.downloadComps);
		// Extract comps data from pdf.
		this.router.post('/pdf-extraction', upload.single('file'), this.comps.extractPdfPropertiesData);
		// Save multiple comps extracted from pdf.
		this.router.post('/save-extracted-comps', this.comps.saveExtractedPdfComps);
		// Get geo-clustered properties for map display
		this.router.post('/map-clusters', this.comps.getGeoClusters);
		// Get cluster details
		// Note: The request body should match the IClusterDetailsRequest interface
		this.router.post('/map-cluster-details', this.comps.getClusterDetails);
		// Save multiple comps extracted from pdf.
		this.router.post('/save-extracted-comp', this.comps.saveExtractedPdfComp);
		// Validate extracted comp data.
		this.router.post('/validate-comp', this.comps.validateComp);
	}
}

export default new CompsRoutes().router;
