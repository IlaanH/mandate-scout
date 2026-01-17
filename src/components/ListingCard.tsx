import { ScoredListing, Priority } from '@/types/listing';
import { cn } from '@/lib/utils';
import { Home, MapPin, Calendar, TrendingDown, Zap, Building2 } from 'lucide-react';

interface ListingCardProps {
  listing: ScoredListing;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ListingCard({ listing, isSelected, onClick }: ListingCardProps) {
  const priorityClasses: Record<Priority, string> = {
    'High': 'priority-badge-high',
    'Medium': 'priority-badge-medium',
    'Low': 'priority-badge-low'
  };

  const scoreColor = listing.priority === 'High' 
    ? 'bg-score-hot' 
    : listing.priority === 'Medium' 
    ? 'bg-score-warm' 
    : 'bg-score-cool';

  const priceFormatted = new Intl.NumberFormat('fr-FR').format(listing.price);
  const hasRecenPriceDrop = listing.priceHistory.length > 0;
  const lastPriceDrop = hasRecenPriceDrop 
    ? listing.priceHistory[listing.priceHistory.length - 1] 
    : null;

  return (
    <div 
      className={cn(
        'listing-card animate-fade-in',
        isSelected && 'listing-card-selected'
      )}
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Score indicator */}
        <div className="flex-shrink-0">
          <div className={cn('score-indicator text-white', scoreColor)}>
            {listing.score}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">
                {listing.propertyType} {listing.surface}m²
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{listing.city}, {listing.geoZone}</span>
              </div>
            </div>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', priorityClasses[listing.priority])}>
              {listing.priority}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-foreground">{priceFormatted}€</span>
            {lastPriceDrop && (
              <span className="flex items-center gap-1 text-sm text-priority-high">
                <TrendingDown className="w-3.5 h-3.5" />
                {lastPriceDrop.percentChange.toFixed(1)}%
              </span>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {listing.daysOnline}j en ligne
            </span>
            <span className="flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              DPE {listing.dpeClass}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {listing.sellerType}
            </span>
          </div>

          {/* Signals */}
          {listing.signals.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {listing.signals.slice(0, 3).map(signal => (
                <span key={signal.id} className="signal-chip">
                  <Zap className="w-3 h-3 text-primary" />
                  {signal.label}
                </span>
              ))}
              {listing.signals.length > 3 && (
                <span className="signal-chip">
                  +{listing.signals.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
