import { Router } from 'express';
import ResCompsService from '../services/residentialComp/resComp.service';
import multer from 'multer';

const upload = multer({
	dest: 'uploads/',
});
class ResCompsRoutes {
	router = Router();
	public resComps = new ResCompsService();

	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		// Get comps for residential comps list
		this.router.post('/list', this.resComps.residentialCompList);

		// Delete residential comp
		this.router.delete('/delete/:id', this.resComps.delete);

		// Create comps
		this.router.post('/create', this.resComps.saveComp);

		// Update comp
		this.router.patch('/update/:id', this.resComps.saveComp);

		// Get cities
		this.router.get('/cities', this.resComps.getCities);

		//Get comp
		this.router.get('/get/:id', this.resComps.getComp);

		// Download residential comps pdf
		this.router.post('/download-res-comps-pdf', this.resComps.downloadComps);

		// Extract comps data from pdf.
		this.router.post('/pdf-extraction', upload.single('file'), this.resComps.extractPropertiesData);

		// Save multiple comps extracted from pdf.
		this.router.post('/save-extracted-comps', this.resComps.saveExtractedResComps);
		// Get geo-clustered properties for map display
		this.router.post('/map-clusters', this.resComps.getGeoClusters);
		// Get cluster details
		// Note: The request body should match the IClusterDetailsRequest interface
		this.router.post('/map-cluster-details', this.resComps.getClusterDetails);
	}
}

export default new ResCompsRoutes().router;
