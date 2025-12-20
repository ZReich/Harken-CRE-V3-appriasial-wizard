import express, { Application } from 'express';
import compression from 'compression';
import { json } from 'body-parser';
import db from './config/db';
import authenticate from './middleware/authenticate';
import cors from 'cors';
import Routes from './routes';
import AuthRoutes from './routes/auth.routes';
import { API_VERSION } from './utils/enums/DefaultEnum';
import { checkConnection } from './middleware/common';
import proxyRouter from './routes/proxy';

export default class App {
	public app: Application;
	public port: number;

	constructor(port = 3001) {
		this.app = express();
		this.app.use(cors());
		this.port = port;
		this.initializeMiddlewares();
		this.app.use(express.static('public'));
		new Routes(this.app);
	}

	private initializeMiddlewares() {
		this.app.use(checkConnection);
		this.app.use(compression());
		this.app.use(json({ limit: 'Infinity' }));
		this.databaseConnection();
		this.app.use(API_VERSION.VERSION + '/proxy', proxyRouter);
		this.app.use(API_VERSION.VERSION + '/auth', AuthRoutes);

		this.app.use(authenticate);

		this.app.get('/', (_, res) => {
			res.status(200).send('Harken Server is running');
		});
	}

	private async databaseConnection() {
		db.sequelize
			.authenticate()
			.then(() => {
				console.log('Database Connected Successfully.');
			})
			.catch((err) => {
				console.error('Unable to connect to the database:', err);
			});
	}

	public listen() {
		this.app.listen(this.port, () => {
			console.log(`App listening on the port ${this.port}`);
		});
	}
}
