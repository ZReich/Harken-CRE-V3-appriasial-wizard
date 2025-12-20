import puppeteer, { LaunchOptions, Browser as PuppeteerBrowser } from 'puppeteer';
import {
	computeExecutablePath,
	resolveBuildId,
	Browser as BrowserEnum,
	BrowserPlatform,
} from '@puppeteer/browsers';

export async function launchBrowser(): Promise<PuppeteerBrowser> {
	// Determine Puppeteer's default cache dir for your user
	const cacheDir = process.env.PUPPETEER_CACHE_DIR || '/home/ubuntu/.cache/puppeteer';

	const buildId = await resolveBuildId(BrowserEnum.CHROME, BrowserPlatform.LINUX, '138.0.7204.94');

	const executablePath = computeExecutablePath({
		browser: BrowserEnum.CHROME,
		buildId,
		platform: BrowserPlatform.LINUX,
		cacheDir,
	});

	const launchOptions: LaunchOptions = {
		executablePath,
		headless: true,
		args: ['--no-sandbox'],
	};

	return puppeteer.launch(launchOptions);
}
