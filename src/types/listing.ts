// Core listing type matching normalized backend data
export interface Listing {
  id: string;
  platform: 'Leboncoin' | 'SeLoger' | 'PAP' | 'Bien\'ici' | 'Logic-Immo';
  city: string;
  address?: string;
  postalCode: string;
  geoZone: string;
  price: number;
  priceHistory: PriceChange[];
  surface: number;
  propertyType: 'Appartement' | 'Maison' | 'Terrain' | 'Local commercial';
  rooms?: number;
  bedrooms?: number;
  publicationDate: string; // ISO date string
  daysOnline: number;
  dpeClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'Non renseigné';
  sellerType: 'Particulier' | 'Professionnel';
  description: string;
  imageUrl?: string;
  url?: string;
}

export interface PriceChange {
  date: string;
  previousPrice: number;
  newPrice: number;
  percentChange: number;
}

// Scoring types
export type Priority = 'High' | 'Medium' | 'Low';

export interface Signal {
  id: string;
  label: string;
  description: string;
  weight: number;
  category: 'age' | 'price' | 'dpe' | 'seller' | 'combo';
}

export interface ScoredListing extends Listing {
  score: number;
  priority: Priority;
  signals: Signal[];
  explanation: string;
}

// Chat types
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  listings?: ScoredListing[];
  isLoading?: boolean;
}

// Intent detection
export type Intent = 
  | 'list_hot_mandates'
  | 'filter_dpe'
  | 'filter_price_drop'
  | 'filter_age'
  | 'filter_city'
  | 'filter_seller_type'
  | 'generate_email'
  | 'generate_sms'
  | 'generate_call_script'
  | 'show_details'
  | 'unknown';

export interface ParsedQuery {
  intent: Intent;
  filters: QueryFilters;
  listingId?: string;
}

export interface QueryFilters {
  city?: string;
  minDaysOnline?: number;
  maxDaysOnline?: number;
  hasPriceDrop?: boolean;
  dpeClasses?: string[];
  sellerType?: 'Particulier' | 'Professionnel';
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  sortBy?: 'score' | 'price' | 'daysOnline' | 'surface';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// Message generation
export type MessageType = 'email' | 'sms' | 'call_script';

export interface GeneratedMessage {
  type: MessageType;
  subject?: string; // for email
  content: string;
  listing: ScoredListing;
  timestamp: Date;
}

// Future-ready interfaces for Phase 2
export interface LLMProvider {
  generateResponse(prompt: string, context: unknown): Promise<string>;
  parseIntent(userMessage: string): Promise<ParsedQuery>;
}

export interface AgentOrchestrator {
  processMessage(message: string, context: ConversationContext): Promise<ChatMessage>;
}

export interface ConversationContext {
  messages: ChatMessage[];
  currentFilters: QueryFilters;
  selectedListing?: ScoredListing;
}
