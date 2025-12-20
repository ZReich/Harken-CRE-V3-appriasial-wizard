import { Router } from 'express';
import CotalityServiceClass from '../services/cotality/cotality.service.class';

class CotalityRoutes {
	router = Router();
	public cotalityService = new CotalityServiceClass();

	constructor() {
		this.initializeRoutes();
	}

	initializeRoutes() {
		// Get property by PropId
		this.router.get('/property/:propId', this.cotalityService.getPropertyByPropId);

		// Get property by address
		this.router.post('/property/address', this.cotalityService.getPropertyByAddress);

		// Get field mapping documentation
		this.router.get('/field-mapping', this.cotalityService.getFieldMapping);

		// Explore property - returns raw + mapped data for all approaches
		this.router.get('/explore/:propId', this.cotalityService.exploreProperty);
	}
}

export default new CotalityRoutes().router;


