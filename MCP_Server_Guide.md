# Card Lookup MCP Server

## Overview

This MCP server provides Magic: The Gathering card lookup capabilities using the Scryfall API. It offers tools for searching and retrieving detailed card information.

## Available MCP Tools

### 2. `card-search` 
- Search for multiple cards using Scryfall's search syntax
- Parameters:
  - `query` (string): Scryfall search query (see https://scryfall.com/docs/syntax)
  - `page` (number, optional): Page number for results (default: 1, each page contains 175 cards)
- Returns: Formatted list of cards with names, sets, types, mana costs, and Scryfall links
- Example queries:
  - "c:red t:dragon" (red dragon creatures)
  - "cmc>=7 t:artifact" (expensive artifacts)
  - "o:flying c:blue" (blue cards with flying)

### 3. `card-lookup`
- Look up a specific card by name
- Parameters:
  - `name` (string): Card name to search for
  - `fuzzy` (boolean, optional): Enable fuzzy matching for misspellings (default: false)
- Returns: Complete card data in JSON format including all Scryfall properties

### 4. `card-collection`
- Look up multiple specific cards by name in a single request
- Parameters:
  - `cardNames` (array of strings): Array of card names to lookup (maximum 75 cards)
- Returns: Formatted summary showing found cards with details and any cards that weren't found
- Example: `["Lightning Bolt", "Counterspell", "Giant Growth"]`

## How to Use

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Configure Claude Desktop**: Add this to your Claude Desktop MCP config:
   ```json
   {
     "mcpServers": {
       "card-lookup-oracle": {
         "command": "npx",
         "args": [
           "mcp-remote",
           "http://localhost:8787/sse"
         ]
       }
     }
   }
   ```

3. **In Claude Desktop**, you can now:
   - **Test connection**: "Use verify-connection to test the MCP server"
   - **Search for cards**: "Search for red dragons in Magic using card-search"
   - **Look up specific cards**: "Look up 'Lightning Bolt' using card-lookup"
   - **Look up multiple cards**: "Use card-collection to get details for Lightning Bolt, Counterspell, and Giant Growth"
   - **Complex queries**: "Find the most expensive artifacts in Magic using card-search"
   - **Handle misspellings**: "Look up 'Lightnig Bolt' with fuzzy matching enabled"

## Example Usage

### Basic Card Search
```
Use card-search to find red dragons
Query: "c:red t:dragon"
```

### Paginated Search
```
Use card-search to find blue spells, show page 2
Query: "c:blue t:instant OR t:sorcery"
Page: 2
```

### Exact Card Lookup
```
Use card-lookup to find "Lightning Bolt"
Name: "Lightning Bolt"
Fuzzy: false
```

### Fuzzy Card Lookup
```
Use card-lookup to find "Lightnig Bolt" with fuzzy matching
Name: "Lightnig Bolt"
Fuzzy: true
```

### Collection Lookup
```
Use card-collection to get details for multiple cards
Card Names: ["Lightning Bolt", "Counterspell", "Giant Growth", "Black Lotus"]
```

## Technical Details

### API Integration
- **Scryfall API**: All card data comes from Scryfall's REST API
- **Rate Limiting**: Respects Scryfall's rate limits (50-100ms between requests)
- **Error Handling**: Provides detailed error messages from Scryfall API
- **Schema Validation**: Uses Zod schemas to validate API responses

### Endpoints
- `/sse` - Server-Sent Events endpoint for MCP remote connection
- `/mcp` - Direct MCP server endpoint

### Headers
All requests to Scryfall include proper headers:
- `User-Agent: Card-Lookup-MCP-Server/1.0`
- `Accept: */*`
- `Content-Type: application/json`

## Troubleshooting

### Connection Issues
1. Ensure the server is running on `http://localhost:8787`
2. Check that the MCP config in Claude Desktop is correct
3. Use `verify-connection` tool to test the connection

### API Errors
- Card not found: Try using fuzzy matching with `card-lookup`
- Invalid search syntax: Refer to Scryfall's search syntax documentation
- Rate limiting: The server handles this automatically with proper delays

### Common Search Syntax
- `c:red` - Red cards
- `t:creature` - Creature cards  
- `cmc>=4` - Cards with mana cost 4 or higher
- `set:khm` - Cards from Kaldheim set
- `o:flying` - Cards with "flying" in rules text
- `pow>=5` - Creatures with power 5 or greater
