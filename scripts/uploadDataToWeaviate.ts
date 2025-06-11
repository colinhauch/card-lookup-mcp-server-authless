import weaviate, { WeaviateClient } from 'weaviate-client';
import fs from 'fs';
import parser from 'stream-json';
import StreamArray from 'stream-json/streamers/StreamArray';
import { chain } from 'stream-chain';
import { ScryfallCard, scryfallCardSchema } from '../src/types/scryfall.js';

// Initialize Weaviate client
const client: WeaviateClient = await weaviate.connectToLocal();

let counter = 0;
const batchSize = 20;
let cardBatch: any[] = [];

async function addCard(cardData: ScryfallCard): Promise<void> {
  try {
    // Validate the card data against our schema
    const validatedCard = scryfallCardSchema.parse(cardData);
    
    // Create properties for Weaviate from the card data
    const properties = {
      // Core identifiers
      id: validatedCard.id,
      oracle_id: validatedCard.oracle_id,
      name: validatedCard.name,
      
      // Gameplay fields
      type_line: validatedCard.type_line,
      oracle_text: validatedCard.oracle_text || '',
      mana_cost: validatedCard.mana_cost || '',
      cmc: validatedCard.cmc,
      colors: validatedCard.colors || [],
      color_identity: validatedCard.color_identity,
      keywords: validatedCard.keywords,
      power: validatedCard.power || '',
      toughness: validatedCard.toughness || '',
      loyalty: validatedCard.loyalty || '',
      
      // Set and rarity information
      set: validatedCard.set,
      set_name: validatedCard.set_name,
      rarity: validatedCard.rarity,
      collector_number: validatedCard.collector_number,
      
      // Text fields
      flavor_text: validatedCard.flavor_text || '',
      artist: validatedCard.artist || '',
      
      // Layout and image info
      layout: validatedCard.layout,
      
      // Store legalities as JSON string since Weaviate might not handle nested objects well
      legalities_json: JSON.stringify(validatedCard.legalities),
      
      // Store prices as JSON string
      prices_json: JSON.stringify(validatedCard.prices),
    };
    
    // Add to batch
    cardBatch.push(properties);
    
    counter++;

    // When the batch counter reaches batchSize, push the objects to Weaviate
    if (counter % batchSize === 0) {
      await flushBatch();
    }
  } catch (error) {
    console.error(`Error processing card ${cardData.name || 'unknown'}:`, error);
  }
}

async function flushBatch(): Promise<void> {
  if (cardBatch.length === 0) return;
  
  try {
    // Use the collections API for newer Weaviate client
    const oracleCardsCollection = client.collections.get('Oracle_Cards_June_11');
    const response = await oracleCardsCollection.data.insertMany(cardBatch);
    
    console.log(`Imported ${counter} cards...`);
    cardBatch = []; // Reset batch
  } catch (error) {
    console.error('Error uploading batch:', error);
    cardBatch = []; // Reset batch on error
  }
}
async function importJson(filePath: string): Promise<void> {
  const pipeline = chain([
    fs.createReadStream(filePath),
    parser(),
    new StreamArray(),
  ]);

  for await (const { value } of pipeline) {
    await addCard(value as ScryfallCard);
  }
}

await importJson('oracle-cards-20250611090300.json');

// Flush any remaining objects
if (cardBatch.length > 0) {
  await flushBatch();
}

console.log(`Finished importing ${counter} cards.`);