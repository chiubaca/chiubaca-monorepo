import {
  createOAuthProvider,
  type RuntimeEnv,
  validateRequestOrigin,
  withSecurityHeaders,
} from "./oauth";

export default {
  async fetch(request: Request, env: RuntimeEnv, ctx: ExecutionContext): Promise<Response> {
    const path = new URL(request.url).pathname;

    try {
      const resource = validateRequestOrigin(request, env);
      const response = await createOAuthProvider(resource.href).fetch(request, env, ctx);
      return withSecurityHeaders(response);
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "worker_request_error",
          method: request.method,
          path,
          errorType: error instanceof Error ? error.name : "UnknownError",
        }),
      );
      return withSecurityHeaders(
        Response.json({ error: "Request could not be processed" }, { status: 500 }),
      );
    }
  },
} satisfies ExportedHandler<RuntimeEnv>;
