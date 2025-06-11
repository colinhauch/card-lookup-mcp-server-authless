import { z } from "zod";
import { scryfallCardSchema, scryfallListSchema, type ScryfallCard, type ScryfallList } from "../types/scryfall";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register Scryfall-related tools with the MCP server
 */
export function registerScryfallTools(server: McpServer): void {
	// Tool to search for cards using Scryfall's search syntax
	server.tool(
		"card-search",
		{
			query: z.string().describe("The search query using Scryfall's search syntax (see https://scryfall.com/docs/syntax)"),
			page: z.number().min(1).optional().describe("The page number to return. Each page contains 175 cards by default."),
		},
		async ({ query, page }) => {
			const baseUrl = "https://api.scryfall.com/cards/search";
			const params = new URLSearchParams({
				q: query,
				...(page && { page: page.toString() }),
			});
			const url = `${baseUrl}?${params.toString()}`;

			// Headers required by Scryfall API
			const headers = {
				'User-Agent': 'Card-Lookup-MCP-Server/1.0',
				'Accept': '*/*',
				'Content-Type': 'application/json',
			};

			try {
				const response = await fetch(url, { headers });
				const data = await response.json() as Record<string, unknown>;
				
				if (!response.ok) {
					// Scryfall returns detailed error messages we can use
					if (typeof data.details === 'string') {
						throw new Error(`Scryfall API error: ${data.details}`);
					}
					throw new Error(`Scryfall API error: ${response.status} - ${typeof data.error === 'string' ? data.error : 'Unknown error'}`);
				}

				let searchResults: ScryfallList;
				try {
					searchResults = scryfallListSchema.parse(data);
				} catch (schemaError) {
					console.error('Schema validation failed:', schemaError);
					throw new Error('The card data from Scryfall did not match our expected schema. This might mean the API has changed.');
				}
			
				// Format the results into a concise list with card names and permalinks
				const cardList = searchResults.data.map(card => ({
					name: card.name,
					permalink: `https://scryfall.com/card/${card.set}/${card.collector_number}`,
					set: card.set_name,
					type: card.type_line,
					...(card.mana_cost && { mana_cost: card.mana_cost })
				}));

				const paginationInfo = {
					total_cards: searchResults.total_cards,
					has_more: searchResults.has_more,
					current_page: page ?? 1,
					cards_shown: cardList.length,
				};

				return {
					content: [
						{
							type: "text",
							text: `Found ${paginationInfo.total_cards} cards matching your search:\n\n` +
								cardList.map(card => 
									`• ${card.name} (${card.set}) - ${card.type}${card.mana_cost ? ` [${card.mana_cost}]` : ''}\n  Link: ${card.permalink}`
								).join('\n\n') +
								(paginationInfo.has_more ? `\n\nShowing cards ${((paginationInfo.current_page - 1) * 175) + 1}-${((paginationInfo.current_page - 1) * 175) + paginationInfo.cards_shown} of ${paginationInfo.total_cards}. Use page parameter to see more results.` : '')
						}
					]
				};
			} catch (error) {
				if (error instanceof Error) {
					throw error;
				}
				throw new Error('An unknown error occurred while fetching the card data');
			}
		}
	);

	// Tool to lookup a specific card by name
	server.tool(
		"card-lookup",
		{
			name: z.string().describe("The name of the Magic: The Gathering card to search for"),
			fuzzy: z.boolean().optional().describe("When true, performs a fuzzy search that can handle minor misspellings"),
		},
		async ({ name, fuzzy }) => {
			const baseUrl = "https://api.scryfall.com/cards/named";
			// Scryfall expects the parameter name to be either 'exact' or 'fuzzy'
			const params = new URLSearchParams({
				[fuzzy ? "fuzzy" : "exact"]: name
			});
			const url = `${baseUrl}?${params.toString()}`;

			// Headers required by Scryfall API
			const headers = {
				'User-Agent': 'Card-Lookup-MCP-Server/1.0',
				'Accept': '*/*',
				'Content-Type': 'application/json',
			};

			try {
				const response = await fetch(url, { headers });
				const data = await response.json() as Record<string, unknown>;
				
				if (!response.ok) {
					// Scryfall returns detailed error messages we can use
					if (typeof data.details === 'string') {
						throw new Error(`Scryfall API error: ${data.details}`);
					}
					throw new Error(`Scryfall API error: ${response.status} - ${typeof data.error === 'string' ? data.error : 'Unknown error'}`);
				}

				let card: ScryfallCard;
				try {
					card = scryfallCardSchema.parse(data);
				} catch (schemaError) {
					console.error('Schema validation failed:', schemaError);
					throw new Error('The card data from Scryfall did not match our expected schema. This might mean the API has changed.');
				}
			
				// Convert the card into a JSON string for the text content
				const cardJson = JSON.stringify(card, null, 2);
				return {
					content: [
						{
							type: "text",
							text: cardJson
						}
					]
				};
			} catch (error) {
				if (error instanceof Error) {
					throw error;
				}
				throw new Error('An unknown error occurred while fetching the card data');
			}
		}
	);
}

// Default export for compatibility
export default { registerScryfallTools };
