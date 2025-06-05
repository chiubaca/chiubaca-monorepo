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
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const originalUrl = new URL(request.url);
    let targetUrlString: string;
    // Determine if HTML content from this request should be processed for link rewriting and base tag injection.
    // This applies if the original request is for the root or any path under /fleeting-notes/
    // and the upstream response is HTML.
    let shouldProcessHtml =
      originalUrl.pathname === "/" ||
      originalUrl.pathname.startsWith("/fleeting-notes/");

    if (originalUrl.pathname === "/") {
      // Root request to notes.chiubaca.com:
      // - Target chiubaca.com/fleeting-notes/
      targetUrlString = `https://chiubaca.com/fleeting-notes/${originalUrl.search}`;
    } else if (originalUrl.pathname.startsWith("/fleeting-notes/")) {
      // If the path already starts with /fleeting-notes/:
      // - Proxy to the same path on chiubaca.com.
      targetUrlString = `https://chiubaca.com${originalUrl.pathname}${originalUrl.search}`;
    } else {
      // For all other paths (typically assets like /_astro/style.css or root-relative links):
      // - Proxy to the same path on chiubaca.com.
      targetUrlString = `https://chiubaca.com${originalUrl.pathname}${originalUrl.search}`;
      // Assets and other paths not under /fleeting-notes/ don't need HTML processing by default.
      shouldProcessHtml = false;
    }

    console.log(`[Worker] Request for: ${originalUrl.toString()}`);
    console.log(`[Worker] Target URL: ${targetUrlString}`);
    console.log(`[Worker] Should process HTML: ${shouldProcessHtml}`);

    const modifiedRequest = new Request(targetUrlString, request);
    const response = await fetch(modifiedRequest);

    if (
      shouldProcessHtml &&
      response.headers.get("Content-Type")?.includes("text/html")
    ) {
      const notesSiteFleetingNotesBase =
        "https://notes.chiubaca.com/fleeting-notes/";
      const originSiteFleetingNotesBase =
        "https://chiubaca.com/fleeting-notes/";

      console.log(
        `[Worker] Rewriting HTML for ${originalUrl.pathname}. Base href: ${notesSiteFleetingNotesBase}`
      );

      let rewriter = new HTMLRewriter();

      // 1. Inject <base> tag to ensure relative URLs resolve to notes.chiubaca.com
      rewriter = rewriter.on("head", {
        element(element) {
          element.prepend(`<base href="${notesSiteFleetingNotesBase}">`, {
            html: true,
          });
        },
      });

      // 2. Rewrite absolute <a> href attributes pointing to the original domain's fleeting notes
      rewriter = rewriter.on("a[href]", {
        element(element) {
          const href = element.getAttribute("href");
          if (href && href.startsWith(originSiteFleetingNotesBase)) {
            const newHref = href.replace(
              originSiteFleetingNotesBase,
              notesSiteFleetingNotesBase
            );
            element.setAttribute("href", newHref);
            console.log(`[Worker] Rewrote <a> href: ${href} to ${newHref}`);
          }
        },
      });

      // Optional: Rewrite other common URL-holding tags like canonical and og:url
      rewriter = rewriter.on('link[rel="canonical"]', {
        element(element) {
          const href = element.getAttribute("href");
          if (href && href.startsWith(originSiteFleetingNotesBase)) {
            const newHref = href.replace(
              originSiteFleetingNotesBase,
              notesSiteFleetingNotesBase
            );
            element.setAttribute("href", newHref);
            console.log(
              `[Worker] Rewrote canonical link: ${href} to ${newHref}`
            );
          }
        },
      });

      rewriter = rewriter.on('meta[property="og:url"]', {
        element(element) {
          const content = element.getAttribute("content");
          if (content && content.startsWith(originSiteFleetingNotesBase)) {
            const newContent = content.replace(
              originSiteFleetingNotesBase,
              notesSiteFleetingNotesBase
            );
            element.setAttribute("content", newContent);
            console.log(`[Worker] Rewrote og:url: ${content} to ${newContent}`);
          }
        },
      });

      return rewriter.transform(response);
    }

    return response;
  },
} satisfies ExportedHandler<Env>;
