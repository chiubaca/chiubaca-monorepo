/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const originalUrl = new URL(request.url);
		let targetUrlString: string;
		let shouldInjectBaseTag = false;

		if (originalUrl.pathname === '/') {
			// Root request to notes.chiubaca.com:
			// - Target chiubaca.com/fleeting-notes/
			// - Inject <base> tag into the HTML response.
			targetUrlString = `https://chiubaca.com/fleeting-notes/${originalUrl.search}`;
			shouldInjectBaseTag = true;
		} else if (originalUrl.pathname.startsWith('/fleeting-notes/')) {
			// If the path already starts with /fleeting-notes/ (likely due to the <base> tag resolving a relative link):
			// - Proxy to the same path on chiubaca.com.
			// e.g., notes.chiubaca.com/fleeting-notes/sub-page -> chiubaca.com/fleeting-notes/sub-page
			targetUrlString = `https://chiubaca.com${originalUrl.pathname}${originalUrl.search}`;
		} else {
			// For all other paths (typically assets like /_astro/style.css or root-relative links):
			// - Proxy to the same path on chiubaca.com.
			// e.g., notes.chiubaca.com/_astro/style.css -> chiubaca.com/_astro/style.css
			targetUrlString = `https://chiubaca.com${originalUrl.pathname}${originalUrl.search}`;
		}

		console.log(`[Worker] Request for: ${originalUrl.toString()}`);
		console.log(`[Worker] Target URL: ${targetUrlString}`);
		console.log(`[Worker] Should inject <base> tag: ${shouldInjectBaseTag}`);

		// Create a new request to the target URL, preserving method, headers, and body from the original.
		const modifiedRequest = new Request(targetUrlString, request);
		const response = await fetch(modifiedRequest);

		if (shouldInjectBaseTag && response.headers.get('Content-Type')?.includes('text/html')) {
			console.log(`[Worker] Injecting <base href="https://chiubaca.com/fleeting-notes/"> for ${originalUrl.pathname}`);
			// Use HTMLRewriter to safely add the <base> tag to the <head>
			return new HTMLRewriter()
				.on('head', {
					element(element) {
						element.prepend('<base href="https://chiubaca.com/fleeting-notes/">', { html: true });
					},
				})
				.transform(response);
		}

		return response;
	},
} satisfies ExportedHandler<Env>;
