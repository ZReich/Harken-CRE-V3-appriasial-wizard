import { Router } from 'express';
import ClientService from '../services/clients/client.service';

class ClientRoutes {
	router = Router();
	public client = new ClientService();

	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		//Add a new Client
		this.router.post('/create', this.client.create);
		//Get all Clients
		this.router.get('/getAll', this.client.getAll);
		//Update client
		this.router.patch('/update/:id', this.client.update);
		//Delete client
		this.router.delete('/delete/:id', this.client.delete);
		//Get client by id
		this.router.get('/get/:id', this.client.getClient);
		//Get all clients detailed list
		this.router.get('/list', this.client.getClientsList);
	}
}

export default new ClientRoutes().router;
