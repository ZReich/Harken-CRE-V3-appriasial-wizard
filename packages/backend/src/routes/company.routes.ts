import { Router } from 'express';
import CompanyService from '../services/company/company.service';

class CompanyRoutes {
	router = Router();
	public company = new CompanyService();

	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		// Add a new Company
		this.router.post('/create', this.company.createComapny);
		//Get all Companies
		this.router.get('/list', this.company.getAll);
		//Get company by id
		this.router.get('/get/:id', this.company.getCompanyDetails);
	}
}

export default new CompanyRoutes().router;
