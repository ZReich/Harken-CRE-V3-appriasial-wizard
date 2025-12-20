import { Router, Request, Response, NextFunction } from 'express';
import { parse } from 'url';
import cors from 'cors';
import request from 'request';

const proxyRouter = Router();

// Middleware to validate the URL
function validUrl(req: Request, res: Response, next: NextFunction): void {
	const targetUrl = req.query.url;
	if (!targetUrl) {
		return next(new Error('No url specified'));
	} else if (typeof targetUrl !== 'string' || parse(targetUrl).host === null) {
		return next(new Error(`Invalid url specified: ${targetUrl}`));
	}
	next();
}

// Proxy endpoint
proxyRouter.get('/', cors(), validUrl, (req: Request, res: Response, next: NextFunction) => {
	const targetUrl = req.query.url as string;
	const responseType = req.query.responseType;

	switch (responseType) {
		case 'blob':
			request(targetUrl).on('error', next).pipe(res);
			break;
		case 'text':
		default:
			request({ url: targetUrl, encoding: 'binary' }, (error, response, body) => {
				if (error) {
					return next(error);
				}
				const contentType = response?.headers?.['content-type'] || 'text/plain';
				const base64Data = Buffer.from(body, 'binary').toString('base64');
				res.send(`data:${contentType};base64,${base64Data}`);
			});
	}
});

export default proxyRouter;
