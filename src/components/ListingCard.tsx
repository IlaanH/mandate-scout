import { ScoredListing, Priority } from '@/types/listing';
import { cn } from '@/lib/utils';
import { MapPin, Calendar, TrendingDown, ChevronRight } from 'lucide-react';

interface ListingCardProps {
  listing: ScoredListing;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ListingCard({ listing, isSelected, onClick }: ListingCardProps) {
  const priorityLabels: Record<Priority, string> = {
    'High': 'Priorité haute',
    'Medium': 'Priorité moyenne',
    'Low': 'Priorité basse'
  };

  const priceFormatted = new Intl.NumberFormat('fr-FR').format(listing.price);
  const hasRecentPriceDrop = listing.priceHistory.length > 0;
  const lastPriceDrop = hasRecentPriceDrop 
    ? listing.priceHistory[listing.priceHistory.length - 1] 
    : null;

  return (
    <div 
      className={cn(
        'listing-card animate-fade-in group',
        isSelected && 'listing-card-selected'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-foreground">
                {listing.propertyType} · {listing.surface}m²
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{listing.city}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-medium text-foreground">{priceFormatted}€</span>
              {lastPriceDrop && (
                <div className="flex items-center gap-1 text-xs text-priority-high justify-end mt-0.5">
                  <TrendingDown className="w-3 h-3" />
                  <span>{lastPriceDrop.percentChange.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Meta + signals */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {listing.daysOnline}j
            </span>
            <span>DPE {listing.dpeClass}</span>
            <span>{listing.sellerType}</span>
            <span className={cn(
              listing.priority === 'High' && 'priority-badge-high',
              listing.priority === 'Medium' && 'priority-badge-medium',
              listing.priority === 'Low' && 'priority-badge-low'
            )}>
              Score {listing.score}
            </span>
          </div>

          {/* Signals as text */}
          {listing.signals.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {listing.signals.slice(0, 2).map(s => s.label).join(' · ')}
              {listing.signals.length > 2 && ` · +${listing.signals.length - 2}`}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 mt-1">
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
}
