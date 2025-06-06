# Card Display Tool Setup

## Overview

This application supports displaying Magic: The Gathering cards from Claude Desktop directly to a localhost webpage in real-time. Here's how the architecture works:

1. **Claude Desktop** - Uses MCP tools to search for cards and send them for display
2. **MCP Server** - Provides tools for card lookup and real-time display
3. **Localhost Webpage** - Displays cards automatically via Server-Sent Events (SSE)
4. **Scryfall Integration** - Frontend fetches card images and details directly from Scryfall API

## Available MCP Tools

### 1. `verify-connection`
- Tests that the MCP connection is working
- No parameters required
- Returns: Success message with verification code

### 2. `card-search` 
- Search for multiple cards using Scryfall's search syntax
- Parameters:
  - `query` (string): Scryfall search query (see https://scryfall.com/docs/syntax)
  - `page` (number, optional): Page number for results (default: 1)
- Returns: Formatted list of cards with names, sets, types, and Scryfall links

### 3. `card-lookup`
- Look up a specific card by name
- Parameters:
  - `name` (string): Card name to search for
  - `fuzzy` (boolean, optional): Enable fuzzy matching for misspellings (default: false)
- Returns: Complete card data in JSON format

### 4. `display-cards` ⭐ **PRIMARY TOOL**
- Send card names to the webpage for real-time display
- Parameters:
  - `cardNames` (string[]): Array of Magic card names to display
  - `page` (number, optional): Page number for pagination (default: 1)
  - `cardsPerPage` (number, optional): Cards per page, max 100 (default: 20)
  - `totalCards` (number, optional): Total cards available for pagination info
- Returns: Confirmation message with pagination details
- **Effect**: Cards appear automatically on the webpage via real-time updates

## How to Use

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the webpage**: Navigate to http://localhost:8787

3. **Configure Claude Desktop**: Add this to your Claude Desktop MCP config:
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

4. **In Claude Desktop**, you can now:
   - **Search and display**: "Search for red dragons in Magic and display the first 5"
   - **Look up specific cards**: "Look up 'Lightning Bolt' and 'Counterspell' and display them"
   - **Complex queries**: "Find the most expensive artifacts in Magic and display the top 10"
   - **Pagination**: "Show me page 2 of those results"

## Typical Workflow

1. **Ask Claude**: "Search for powerful blue spells and display the first 8"
2. **Claude will**:
   - Use `card-search` to find blue spells
   - Use `display-cards` with the card names
3. **The webpage automatically updates** - no refresh needed!
4. **Cards appear instantly** with high-resolution images from Scryfall
5. **Click any card** to view it on Scryfall.com

## Technical Architecture

### Real-Time Display System
- **Server-Sent Events (SSE)**: React app connects to `/api/card-updates` for real-time updates
- **No Polling**: Eliminated repeated API calls - cards appear instantly when tools are used
- **Global State**: MCP tools store card names in server memory for immediate delivery
- **Scryfall Integration**: Frontend fetches card details and images directly from Scryfall API

### API Endpoints
- `GET /api/card-updates` - SSE endpoint for real-time card updates (used internally)
- `POST /api/display-cards` - REST endpoint for manual card display (optional)
- `POST /api/process` - Processes natural language queries through the system

### Data Flow
1. **Claude Desktop** → Calls `display-cards` MCP tool with card names
2. **MCP Server** → Stores card names in `pendingCardUpdate` global variable  
3. **SSE Endpoint** → Polls for updates every 500ms, sends to React app
4. **React App** → Receives card names, fetches details from Scryfall, displays cards
5. **User** → Sees cards appear automatically with images and metadata

## Features

- ✅ **Real-time updates**: Cards appear instantly when Claude uses the tools
- ✅ **High-resolution images**: Cards displayed with crisp Scryfall images
- ✅ **Responsive grid**: Beautiful layout that adapts to screen size
- ✅ **Click to view**: Click any card to open its Scryfall page
- ✅ **No duplicate polling**: Efficient architecture with no repeated API calls
- ✅ **Pagination support**: Handle large result sets with proper pagination
- ✅ **CORS enabled**: Card images load properly from external sources
- ✅ **Auto-cleanup**: SSE connections automatically close to prevent memory leaks

## Troubleshooting

### Cards not appearing?
1. Check that the webpage is open at http://localhost:8787
2. Verify the MCP server is running with `npm run dev`
3. Check browser console for SSE connection messages
4. Ensure Claude Desktop is using the `display-cards` tool (not old publish tools)

### Images not loading?
- Card images are fetched directly from Scryfall - check internet connection
- CORS is properly configured for cross-origin image requests

### Connection issues?
- SSE connections auto-reconnect and timeout after 30 seconds
- Refresh the webpage to establish a new SSE connection if needed
