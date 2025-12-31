import { Application } from 'express';
import UserRoutes from './user.routes';
import CompsRoutes from './comps.routes';
import CompanyRoutes from './company.routes';
import ClientRoutes from './client.routes';
import { API_VERSION } from '../utils/enums/DefaultEnum';
import AccountsRoutes from './accounts.routes';
import ResCompsRoutes from './residentialComp.routes';
import UploadFilesRoutes from './uploadFiles.route';
import AppraisalsRoute from './appraisals.routes';
import TemplateRoutes from './template.routes';
import CommonService from '../services/common/common.service';
import { Router } from 'express';
import evaluationsRoutes from './evaluations.routes';
import resEvaluationsRoutes from './resEvaluations.routes';
export default class Routes {
	router = Router();
	public commonService = new CommonService();
	constructor(app: Application) {
		app.use(API_VERSION.VERSION + '/user', UserRoutes);
		app.use(API_VERSION.VERSION + '/comps', CompsRoutes);
		app.use(API_VERSION.VERSION + '/company', CompanyRoutes);
		app.use(API_VERSION.VERSION + '/client', ClientRoutes);
		app.use(API_VERSION.VERSION + '/accounts', AccountsRoutes);
		app.use(API_VERSION.VERSION + '/resComps', ResCompsRoutes);
		app.use(API_VERSION.VERSION + '/upload-files', UploadFilesRoutes);
		app.use(API_VERSION.VERSION + '/appraisals', AppraisalsRoute);
		app.use(API_VERSION.VERSION + '/template', TemplateRoutes);
		this.router.get(
			`${API_VERSION.VERSION}/globalCodes`,
			this.commonService.getAllGlobalCodes.bind(this.commonService),
		);
		this.router.post(
			`${API_VERSION.VERSION}/get-wikipedia-info`,
			this.commonService.getWikipediaInfo.bind(this.commonService),
		);
		this.router.post(
			`${API_VERSION.VERSION}/search-property`,
			this.commonService.searchProperty.bind(this.commonService),
		);
		this.router.get(
			`${API_VERSION.VERSION}/get-property-data`,
			this.commonService.getPropertyData.bind(this.commonService),
		);
		app.use(API_VERSION.VERSION + '/evaluations', evaluationsRoutes);
		app.use(API_VERSION.VERSION + '/res-evaluations', resEvaluationsRoutes);
		app.use(this.router);
	}
}
