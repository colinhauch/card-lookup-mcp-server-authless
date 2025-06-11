import { z } from "zod";
import { getDatabase } from "../services/databaseService";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register database-related tools with the MCP server
 */
export function registerDatabaseTools(server: McpServer): void {
	// Tool to check database connection status
	server.tool(
		"database-status",
		{},
		async () => {
			const db = getDatabase();
			const isConnected = db.isConnectedToDatabase();
			
			if (!isConnected) {
				return {
					content: [
						{
							type: "text",
							text: "❌ Database is not connected. The Weaviate database connection is not available.",
						},
					],
				};
			}

			// Test the actual connection
			const connectionWorks = await db.testConnection();
			
			return {
				content: [
					{
						type: "text",
						text: connectionWorks 
							? "✅ Database is connected and ready for queries."
							: "⚠️ Database connection exists but is not responding to health checks.",
					},
				],
			};
		}
	);

	// Tool to search cards in the vector database (placeholder for future implementation)
	server.tool(
		"database-search-cards",
		{
			query: z.string().describe("The search query to find similar cards in the vector database"),
			limit: z.number().min(1).max(100).optional().describe("Maximum number of results to return (default: 10)"),
		},
		async ({ query, limit = 10 }) => {
			const db = getDatabase();
			
			if (!db.isConnectedToDatabase()) {
				return {
					content: [
						{
							type: "text",
							text: "❌ Database is not connected. Cannot perform vector search.",
						},
					],
				};
			}

			// TODO: Implement actual vector search logic here
			// This is a placeholder that shows the structure for future implementation
			try {
				const client = db.getClient();
				if (!client) {
					throw new Error("Database client is not available");
				}

				// Placeholder response - replace with actual Weaviate query
				return {
					content: [
						{
							type: "text",
							text: `🔍 Vector search functionality is not yet implemented.\n\nQuery: "${query}"\nLimit: ${limit}\n\nThis tool is ready for implementation with Weaviate vector search capabilities.`,
						},
					],
				};
			} catch (error) {
				console.error('Database search error:', error);
				return {
					content: [
						{
							type: "text",
							text: `❌ Database search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
						},
					],
				};
			}
		}
	);

	// Tool to get database statistics (placeholder for future implementation)
	server.tool(
		"database-stats",
		{},
		async () => {
			const db = getDatabase();
			
			if (!db.isConnectedToDatabase()) {
				return {
					content: [
						{
							type: "text",
							text: "❌ Database is not connected. Cannot retrieve statistics.",
						},
					],
				};
			}

			try {
				const client = db.getClient();
				if (!client) {
					throw new Error("Database client is not available");
				}

				// TODO: Implement actual database statistics retrieval
				// This is a placeholder for future implementation
				return {
					content: [
						{
							type: "text",
							text: "📊 Database statistics functionality is not yet implemented.\n\nThis tool is ready for implementation with Weaviate cluster statistics and collection information.",
						},
					],
				};
			} catch (error) {
				console.error('Database stats error:', error);
				return {
					content: [
						{
							type: "text",
							text: `❌ Failed to retrieve database statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
						},
					],
				};
			}
		}
	);
}

// Default export for compatibility
export default { registerDatabaseTools };
