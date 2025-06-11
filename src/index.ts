import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDatabase } from "./services/databaseService";
import { registerDatabaseTools } from "./tools/databaseTools";
import { registerScryfallTools } from "./tools/scryfallTools";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Oracle",
		version: "1.0.0",
	});
	async init(env?: Env) {
		// Register database tools
		registerDatabaseTools(this.server);
		
		// Register Scryfall tools
		registerScryfallTools(this.server);

	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		// Initialize database connection on first request if not already connected
		const db = getDatabase();
		if (!db.isConnectedToDatabase() && env.WEAVIATE_URL && env.WEAVIATE_API_KEY) {
			try {
				await db.connect({
					WEAVIATE_URL: env.WEAVIATE_URL,
					WEAVIATE_API_KEY: env.WEAVIATE_API_KEY,
				});
			} catch (error) {
				console.error('Failed to initialize database connection:', error);
				// Continue without database - tools will handle the missing connection gracefully
			}
		}

		const url = new URL(request.url);

		// Handle API endpoints
		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		// Serve static files for non-API routes
		if (url.pathname === '/' || !url.pathname.startsWith('/api')) {
			try {
				// Handle root path
				if (url.pathname === '/') {
					return env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
				}
				
				// Try to serve the static asset
				return env.ASSETS.fetch(request);
			} catch (e) {
				console.error('Error serving static file:', e);
				return new Response('Not Found', { status: 404 });
			}
		}

		return new Response('Not Found', { status: 404 });
	},
};
