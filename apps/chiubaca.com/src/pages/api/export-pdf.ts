import { env } from "cloudflare:workers";
import puppeteer from "@cloudflare/puppeteer";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check browser binding
    if (!env.BROWSER) {
      console.error("Browser rendering binding not found");
      return new Response(
        JSON.stringify({ error: "PDF generation service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Launch browser
    const browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();

    // Determine base URL based on environment
    const baseUrl = import.meta.env.PROD
      ? "https://chiubaca.com"
      : "http://localhost:4321";

    // Navigate to PDF page
    await page.goto(`${baseUrl}/cv/pdf`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // TODO: Add caching here using KV
    // Example: const cached = await env.CV_KV.get('alex-chiu-cv', 'arrayBuffer');
    // if (cached) return new Response(cached, { ... });

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: false,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "40px",
        right: "40px",
      },
    });

    // Close browser
    await browser.close();

    // TODO: Cache the PDF
    // await env.CV_KV.put('alex-chiu-cv', pdf, { expirationTtl: 3600 });

    // Return PDF
    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="alex-chiu-cv.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
