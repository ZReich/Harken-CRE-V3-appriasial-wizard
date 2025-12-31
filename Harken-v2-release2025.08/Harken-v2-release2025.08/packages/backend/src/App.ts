import express, { Application } from 'express';
import compression from 'compression';
import cors from 'cors';
import { json } from 'body-parser';

import db from './config/db';
import Routes from './routes';
import AuthRoutes from './routes/auth.routes';
import proxyRouter from './routes/proxy';

import authenticate from './middleware/authenticate';
import { checkConnection } from './middleware/common';

import { API_VERSION } from './utils/enums/DefaultEnum';
import EvaluationsService from './services/evaluations/evaluations.service';
import ResEvaluationsService from './services/resEvaluations/resEvaluations.service';

export default class App {
	public app: Application;
	public port: number;

	private evaluationsService: EvaluationsService;
	private resEvaluationsService: ResEvaluationsService;

	constructor(port = 3001) {
		this.app = express();
		this.port = port;
		this.evaluationsService = new EvaluationsService();
		this.resEvaluationsService = new ResEvaluationsService();

		this.initializeMiddlewares();
		this.initializeRoutes();
		this.initializeDatabase();
	}

	/* -------------------- Middlewares -------------------- */
	private initializeMiddlewares() {
		this.app.use(cors());
		this.app.use(compression());
		this.app.use(json({ limit: 'Infinity' }));
		this.app.use(checkConnection);
		this.app.use(express.static('public'));
	}

	/* -------------------- Routes -------------------- */
	private initializeRoutes() {
		// Public routes
		this.app.use(`${API_VERSION.VERSION}/proxy`, proxyRouter);
		this.app.use(`${API_VERSION.VERSION}/auth`, AuthRoutes);



		// Health check
		this.app.get('/', (_, res) => {
			res.status(200).send('Harken Server is running');
		});

		// Protected routes
		this.app.use(authenticate);
		new Routes(this.app);
	}

	/* -------------------- Database -------------------- */
	private initializeDatabase() {
		db.sequelize
			.authenticate()
			.then(() => console.log('Database Connected Successfully.'))
			.catch((err) =>
				console.error('Unable to connect to the database:', err),
			);
	}

	/* -------------------- Server -------------------- */
	public listen() {
		this.app.listen(this.port, () => {
			console.log(`App listening on port ${this.port}`);
		});
	}
}
