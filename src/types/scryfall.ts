import { z } from "zod";

// Common types used across multiple schemas
const colorsSchema = z.array(z.enum(["W", "U", "B", "R", "G"]));

// Schema for image URIs that Scryfall provides
const imageUrisSchema = z.object({
	small: z.string().url().optional(),
	normal: z.string().url().optional(),
	large: z.string().url().optional(),
	png: z.string().url().optional(),
	art_crop: z.string().url().optional(),
	border_crop: z.string().url().optional(),
});

// Schema for card faces (used in multi-faced cards)
export const cardFaceSchema = z.object({
	object: z.literal("card_face"),
	name: z.string(),
	mana_cost: z.string(),
	type_line: z.string().optional(),
	oracle_text: z.string().optional(),
	colors: colorsSchema.optional(),
	color_indicator: colorsSchema.optional(),
	power: z.string().optional(),
	toughness: z.string().optional(),
	loyalty: z.string().optional(),
	defense: z.string().optional(),
	artist: z.string().optional(),
	artist_id: z.string().uuid().optional(),
	illustration_id: z.string().uuid().optional(),
	image_uris: imageUrisSchema.optional(),
	flavor_text: z.string().optional(),
	printed_name: z.string().optional(),
	printed_text: z.string().optional(),
	printed_type_line: z.string().optional(),
	watermark: z.string().optional(),
});

// Schema for related cards
export const relatedCardSchema = z.object({
	object: z.literal("related_card"),
	id: z.string().uuid(),
	component: z.enum(["token", "meld_part", "meld_result", "combo_piece"]),
	name: z.string(),
	type_line: z.string(),
	uri: z.string().url(),
});

// Main card schema
export const scryfallCardSchema = z.object({
	// Core card fields
	id: z.string().uuid(),
	lang: z.string(),
	object: z.literal("card"),
	oracle_id: z.string().uuid().optional(),
	layout: z.string(),
	
	// Gameplay fields
	name: z.string(),
	printed_name: z.string().optional(),
	type_line: z.string(),
	oracle_text: z.string().optional(),
	mana_cost: z.string().optional(),
	cmc: z.number(),
	colors: colorsSchema.optional(),
	color_identity: colorsSchema,
	keywords: z.array(z.string()),
	power: z.string().optional(),
	toughness: z.string().optional(),
	loyalty: z.string().optional(),
	defense: z.string().optional(),
	
	// Card faces for multi-faced cards
	card_faces: z.array(cardFaceSchema).optional(),
	
	// Related cards
	all_parts: z.array(relatedCardSchema).optional(),
	
	// Image data
	image_uris: imageUrisSchema.optional(),
	
	// Additional fields that might be useful
	rarity: z.enum(["common", "uncommon", "rare", "mythic", "special", "bonus"]),
	set: z.string(),
	set_name: z.string(),
	collector_number: z.string(),
	flavor_text: z.string().optional(),
	artist: z.string().optional(),
	
	// Prices and legality
	prices: z.record(z.string(), z.string().nullable()),
	legalities: z.record(z.string(), z.enum(["legal", "not_legal", "restricted", "banned"])),
});

export type ScryfallCard = z.infer<typeof scryfallCardSchema>;

// Schema for a list of cards returned by a search
export const scryfallListSchema = z.object({
    object: z.literal("list"),
    total_cards: z.number(),
    has_more: z.boolean(),
    next_page: z.string().url().optional(),
    data: z.array(scryfallCardSchema),
});

export type ScryfallList = z.infer<typeof scryfallListSchema>;
