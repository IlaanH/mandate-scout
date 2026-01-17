import { Listing, ScoredListing, Signal, Priority } from '@/types/listing';

// Signal definitions with weights
const SIGNALS = {
  LISTING_OLD_30: {
    id: 'listing_old_30',
    label: 'Annonce > 30 jours',
    description: 'L\'annonce est en ligne depuis plus de 30 jours',
    weight: 15,
    category: 'age' as const
  },
  LISTING_OLD_60: {
    id: 'listing_old_60',
    label: 'Annonce > 60 jours',
    description: 'L\'annonce est en ligne depuis plus de 60 jours - vendeur potentiellement motivé',
    weight: 25,
    category: 'age' as const
  },
  LISTING_OLD_90: {
    id: 'listing_old_90',
    label: 'Annonce > 90 jours',
    description: 'L\'annonce est en ligne depuis plus de 90 jours - forte probabilité de motivation',
    weight: 35,
    category: 'age' as const
  },
  PRICE_DROP: {
    id: 'price_drop',
    label: 'Baisse de prix',
    description: 'Le vendeur a déjà baissé son prix',
    weight: 20,
    category: 'price' as const
  },
  MULTIPLE_PRICE_DROPS: {
    id: 'multiple_price_drops',
    label: 'Baisses multiples',
    description: 'Plusieurs baisses de prix successives - vendeur très motivé',
    weight: 30,
    category: 'price' as const
  },
  DPE_F: {
    id: 'dpe_f',
    label: 'DPE F',
    description: 'Passoire thermique - interdiction de location à venir',
    weight: 20,
    category: 'dpe' as const
  },
  DPE_G: {
    id: 'dpe_g',
    label: 'DPE G',
    description: 'Passoire thermique critique - interdiction de location imminente',
    weight: 25,
    category: 'dpe' as const
  },
  PRIVATE_SELLER: {
    id: 'private_seller',
    label: 'Particulier',
    description: 'Vendeur particulier - pas d\'exclusivité agence',
    weight: 15,
    category: 'seller' as const
  },
  COMBO_OLD_PRICE_DROP: {
    id: 'combo_old_price_drop',
    label: 'Combo: Ancien + Baisse',
    description: 'Annonce ancienne avec baisse de prix - excellente opportunité',
    weight: 15,
    category: 'combo' as const
  },
  COMBO_DPE_OLD: {
    id: 'combo_dpe_old',
    label: 'Combo: DPE F/G + Ancien',
    description: 'Passoire thermique ancienne - vendeur sous pression',
    weight: 20,
    category: 'combo' as const
  },
  COMBO_TRIPLE: {
    id: 'combo_triple',
    label: 'Combo Triple',
    description: 'DPE F/G + Ancien + Baisse de prix - mandat prioritaire',
    weight: 25,
    category: 'combo' as const
  }
};

export function calculateScore(listing: Listing): { score: number; signals: Signal[] } {
  const signals: Signal[] = [];
  let score = 0;

  // Age signals (mutually exclusive, take the highest)
  if (listing.daysOnline > 90) {
    signals.push(SIGNALS.LISTING_OLD_90);
    score += SIGNALS.LISTING_OLD_90.weight;
  } else if (listing.daysOnline > 60) {
    signals.push(SIGNALS.LISTING_OLD_60);
    score += SIGNALS.LISTING_OLD_60.weight;
  } else if (listing.daysOnline > 30) {
    signals.push(SIGNALS.LISTING_OLD_30);
    score += SIGNALS.LISTING_OLD_30.weight;
  }

  // Price drop signals
  const hasPriceDrop = listing.priceHistory.length > 0;
  const hasMultiplePriceDrops = listing.priceHistory.length > 1;
  
  if (hasMultiplePriceDrops) {
    signals.push(SIGNALS.MULTIPLE_PRICE_DROPS);
    score += SIGNALS.MULTIPLE_PRICE_DROPS.weight;
  } else if (hasPriceDrop) {
    signals.push(SIGNALS.PRICE_DROP);
    score += SIGNALS.PRICE_DROP.weight;
  }

  // DPE signals (mutually exclusive)
  if (listing.dpeClass === 'G') {
    signals.push(SIGNALS.DPE_G);
    score += SIGNALS.DPE_G.weight;
  } else if (listing.dpeClass === 'F') {
    signals.push(SIGNALS.DPE_F);
    score += SIGNALS.DPE_F.weight;
  }

  // Seller type
  if (listing.sellerType === 'Particulier') {
    signals.push(SIGNALS.PRIVATE_SELLER);
    score += SIGNALS.PRIVATE_SELLER.weight;
  }

  // Combo bonuses
  const isOld = listing.daysOnline > 30;
  const isDpeFG = listing.dpeClass === 'F' || listing.dpeClass === 'G';

  if (isOld && hasPriceDrop && isDpeFG) {
    signals.push(SIGNALS.COMBO_TRIPLE);
    score += SIGNALS.COMBO_TRIPLE.weight;
  } else {
    if (isOld && hasPriceDrop) {
      signals.push(SIGNALS.COMBO_OLD_PRICE_DROP);
      score += SIGNALS.COMBO_OLD_PRICE_DROP.weight;
    }
    if (isOld && isDpeFG) {
      signals.push(SIGNALS.COMBO_DPE_OLD);
      score += SIGNALS.COMBO_DPE_OLD.weight;
    }
  }

  return { score, signals };
}

export function getPriority(score: number): Priority {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function generateExplanation(signals: Signal[]): string {
  if (signals.length === 0) {
    return 'Aucun signal fort détecté. Opportunité standard.';
  }

  const parts = signals.map(s => s.label);
  
  if (signals.some(s => s.id === 'combo_triple')) {
    return `🔥 Opportunité exceptionnelle: ${parts.join(' + ')}. Vendeur probablement très motivé.`;
  }
  
  if (signals.some(s => s.category === 'combo')) {
    return `⚡ Combinaison de signaux: ${parts.join(' + ')}. Forte probabilité de mandat.`;
  }

  return `Signaux détectés: ${parts.join(', ')}.`;
}

export function scoreListing(listing: Listing): ScoredListing {
  const { score, signals } = calculateScore(listing);
  const priority = getPriority(score);
  const explanation = generateExplanation(signals);

  return {
    ...listing,
    score,
    priority,
    signals,
    explanation
  };
}

export function scoreAndSortListings(listings: Listing[]): ScoredListing[] {
  return listings
    .map(scoreListing)
    .sort((a, b) => b.score - a.score);
}
