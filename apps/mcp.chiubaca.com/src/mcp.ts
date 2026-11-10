import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import { addAttachment, AttachmentError, attachmentInputSchema } from "./attachments";
import {
  addFleetingNote,
  FleetingNoteError,
  fleetingNoteInputSchema,
  type NotesSecrets,
} from "./fleeting-notes";

export function createMcpServer(env: NotesSecrets): McpServer {
  const server = new McpServer({
    name: "chiubaca-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "hello",
    {
      title: "Hello",
      description: "Return a greeting.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [{ type: "text", text: "Hello, World!" }],
    }),
  );

  server.registerTool(
    "add_fleeting_note",
    {
      title: "Add fleeting note",
      description:
        "Save Markdown to chiubaca/notes on main. Creates a dated fleeting note or appends a UTC-timestamped entry, preserving existing content. This writes to GitHub and may be published by the blog's notes pipeline; only call when the user asks to save a note. Do not blindly retry an uncertain write: appending is not idempotent.",
      inputSchema: fleetingNoteInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const result = await addFleetingNote(env, input);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
          structuredContent: result,
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                error instanceof FleetingNoteError
                  ? error.message
                  : "The note could not be saved. Check GitHub before retrying to avoid duplicates.",
            },
          ],
        };
      }
    },
  );

  server.registerTool(
    "add_attachment",
    {
      title: "Add attachment",
      description:
        "Save a base64-encoded image to chiubaca/notes/attachments on main. Returns a markdown reference suitable for fleeting or permanent notes. Existing attachments are not overwritten: a UTC timestamp is appended to the filename when a collision occurs. This writes to GitHub and the file may be published by the blog's notes pipeline; only call when the user asks to save an attachment.",
      inputSchema: attachmentInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input) => {
      try {
        const result = await addAttachment(env, input);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
          structuredContent: result,
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                error instanceof AttachmentError
                  ? error.message
                  : "The attachment could not be saved. Check GitHub before retrying.",
            },
          ],
        };
      }
    },
  );

  return server;
}

export function mcpHandler(
  request: Request,
  env: NotesSecrets,
  ctx: ExecutionContext,
): Promise<Response> {
  return createMcpHandler(() => createMcpServer(env), {
    route: "/mcp",
    legacy: "stateless",
    allowedHostnames: ["mcp.chiubaca.com", "localhost", "127.0.0.1", "::1"],
    allowedOriginHostnames: ["mcp.chiubaca.com", "localhost", "127.0.0.1", "::1"],
    onerror(error) {
      console.error(
        JSON.stringify({
          event: "mcp_handler_error",
          errorType: error.name,
        }),
      );
    },
  })(request, env, ctx);
}
