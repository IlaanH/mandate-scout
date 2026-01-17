import { mockListings } from '@/data/mockListings';
import { Listing, ScoredListing, QueryFilters, ParsedQuery, Intent } from '@/types/listing';
import { scoreAndSortListings, scoreListing } from './scoringService';

// Simulates database query - will be replaced with real API calls in Phase 2
export async function queryListings(filters: QueryFilters): Promise<ScoredListing[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let results = [...mockListings];

  // Apply filters
  if (filters.city) {
    const cityLower = filters.city.toLowerCase();
    results = results.filter(l => 
      l.city.toLowerCase().includes(cityLower) || 
      l.geoZone.toLowerCase().includes(cityLower)
    );
  }

  if (filters.minDaysOnline !== undefined) {
    results = results.filter(l => l.daysOnline >= filters.minDaysOnline!);
  }

  if (filters.maxDaysOnline !== undefined) {
    results = results.filter(l => l.daysOnline <= filters.maxDaysOnline!);
  }

  if (filters.hasPriceDrop) {
    results = results.filter(l => l.priceHistory.length > 0);
  }

  if (filters.dpeClasses && filters.dpeClasses.length > 0) {
    results = results.filter(l => filters.dpeClasses!.includes(l.dpeClass));
  }

  if (filters.sellerType) {
    results = results.filter(l => l.sellerType === filters.sellerType);
  }

  if (filters.minPrice !== undefined) {
    results = results.filter(l => l.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    results = results.filter(l => l.price <= filters.maxPrice!);
  }

  if (filters.propertyType) {
    results = results.filter(l => l.propertyType === filters.propertyType);
  }

  // Score and sort
  const scored = scoreAndSortListings(results);

  // Apply sorting if different from default score sort
  if (filters.sortBy && filters.sortBy !== 'score') {
    scored.sort((a, b) => {
      const aVal = a[filters.sortBy!];
      const bVal = b[filters.sortBy!];
      const multiplier = filters.sortOrder === 'asc' ? 1 : -1;
      return (Number(aVal) - Number(bVal)) * multiplier;
    });
  }

  // Apply limit
  if (filters.limit) {
    return scored.slice(0, filters.limit);
  }

  return scored;
}

export function getListingById(id: string): ScoredListing | null {
  const listing = mockListings.find(l => l.id === id);
  if (!listing) return null;
  return scoreListing(listing);
}

// Intent detection - will be replaced by LLM in Phase 2
export function parseUserQuery(message: string): ParsedQuery {
  const messageLower = message.toLowerCase();
  const filters: QueryFilters = {};
  let intent: Intent = 'unknown';

  // City detection
  const cities = ['lyon', 'villeurbanne', 'caluire', 'bron', 'oullins', 'tassin', 'vénissieux'];
  for (const city of cities) {
    if (messageLower.includes(city)) {
      filters.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Intent: Hot mandates
  if (
    messageLower.includes('chaud') || 
    messageLower.includes('prioritaire') || 
    messageLower.includes('urgent') ||
    messageLower.includes('top') ||
    messageLower.includes('meilleur')
  ) {
    intent = 'list_hot_mandates';
    filters.sortBy = 'score';
    filters.sortOrder = 'desc';
    filters.limit = 5;
  }

  // Intent: DPE filter
  if (
    messageLower.includes('dpe') || 
    messageLower.includes('passoire') ||
    messageLower.includes('f/g') ||
    messageLower.includes('f ou g')
  ) {
    intent = 'filter_dpe';
    filters.dpeClasses = ['F', 'G'];
  }

  // Intent: Price drop
  if (
    messageLower.includes('baisse') || 
    messageLower.includes('négoci') ||
    messageLower.includes('réduit')
  ) {
    intent = 'filter_price_drop';
    filters.hasPriceDrop = true;
  }

  // Intent: Age filter
  if (messageLower.includes('>60') || messageLower.includes('60 jour') || messageLower.includes('plus de 60')) {
    intent = 'filter_age';
    filters.minDaysOnline = 60;
  } else if (messageLower.includes('>30') || messageLower.includes('30 jour') || messageLower.includes('plus de 30')) {
    intent = 'filter_age';
    filters.minDaysOnline = 30;
  } else if (messageLower.includes('ancien') || messageLower.includes('longtemps')) {
    intent = 'filter_age';
    filters.minDaysOnline = 30;
  }

  // Intent: Seller type
  if (messageLower.includes('particulier') || messageLower.includes('privé')) {
    intent = 'filter_seller_type';
    filters.sellerType = 'Particulier';
  }

  // Intent: Message generation
  if (messageLower.includes('email') || messageLower.includes('mail') || messageLower.includes('courriel')) {
    intent = 'generate_email';
  } else if (messageLower.includes('sms') || messageLower.includes('texto')) {
    intent = 'generate_sms';
  } else if (messageLower.includes('appel') || messageLower.includes('téléphone') || messageLower.includes('script')) {
    intent = 'generate_call_script';
  }

  // If no specific intent, default to listing hot mandates
  if (intent === 'unknown' && !filters.city && !filters.dpeClasses) {
    intent = 'list_hot_mandates';
    filters.sortBy = 'score';
    filters.sortOrder = 'desc';
    filters.limit = 10;
  }

  return { intent, filters };
}

// Response generator - will be replaced by LLM in Phase 2
export function generateResponseText(intent: Intent, listings: ScoredListing[], filters: QueryFilters): string {
  const count = listings.length;
  
  if (count === 0) {
    return "Je n'ai trouvé aucune annonce correspondant à ces critères. Voulez-vous élargir votre recherche ?";
  }

  const cityPart = filters.city ? ` à ${filters.city}` : '';
  const highPriorityCount = listings.filter(l => l.priority === 'High').length;

  switch (intent) {
    case 'list_hot_mandates':
      return `Voici les ${count} mandats les plus chauds${cityPart}. ${highPriorityCount} sont en priorité haute avec des signaux forts (vendeur motivé, baisse de prix, DPE contraignant).`;
    
    case 'filter_dpe':
      return `J'ai trouvé ${count} annonces DPE F ou G${cityPart}. Ces passoires thermiques représentent une excellente opportunité de mandat car les propriétaires seront bientôt contraints de rénover ou vendre.`;
    
    case 'filter_price_drop':
      return `${count} annonces ont subi une baisse de prix${cityPart}. Cela indique généralement un vendeur motivé, prêt à négocier.`;
    
    case 'filter_age':
      return `${count} annonces sont en ligne depuis plus de ${filters.minDaysOnline || 30} jours${cityPart}. Le temps joue en votre faveur pour la négociation.`;
    
    case 'filter_seller_type':
      return `${count} annonces de particuliers${cityPart}. Sans mandat exclusif d'agence, le terrain est libre.`;
    
    default:
      return `J'ai trouvé ${count} annonces correspondant à votre recherche${cityPart}. Cliquez sur une annonce pour voir les détails et les signaux détectés.`;
  }
}
