import { ScoredListing } from '@/types/listing';
import { X, ExternalLink, Mail, MessageSquare, Phone, TrendingDown, Zap, Calendar, Home, MapPin, Building2, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScoreBreakdown } from './ScoreBreakdown';
import { useState } from 'react';
import { MessageGenerator } from './MessageGenerator';

interface ListingDetailPanelProps {
  listing: ScoredListing | null;
  onClose: () => void;
}

export function ListingDetailPanel({ listing, onClose }: ListingDetailPanelProps) {
  const [showMessageGenerator, setShowMessageGenerator] = useState<'email' | 'sms' | 'call_script' | null>(null);

  if (!listing) {
    return (
      <div className="context-panel p-6 flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Sélectionnez une annonce pour voir les détails</p>
        </div>
      </div>
    );
  }

  const priceFormatted = new Intl.NumberFormat('fr-FR').format(listing.price);

  if (showMessageGenerator) {
    return (
      <div className="context-panel h-full animate-slide-in-right">
        <MessageGenerator 
          listing={listing} 
          type={showMessageGenerator} 
          onBack={() => setShowMessageGenerator(null)} 
        />
      </div>
    );
  }

  return (
    <div className="context-panel h-full overflow-y-auto scrollbar-thin animate-slide-in-right">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Détails de l'annonce</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Image placeholder */}
        {listing.imageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
            <img 
              src={listing.imageUrl} 
              alt={`${listing.propertyType} à ${listing.city}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title and price */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {listing.platform}
            </span>
            <span className="text-xs text-muted-foreground">
              {listing.sellerType}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            {listing.propertyType} {listing.surface}m²
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            {listing.address || listing.city}, {listing.postalCode}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-foreground">{priceFormatted}€</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(listing.price / listing.surface).toLocaleString('fr-FR')}€/m²
            </span>
          </div>
        </div>

        {/* Price history */}
        {listing.priceHistory.length > 0 && (
          <div className="bg-priority-high/5 border border-priority-high/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-priority-high flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4" />
              Historique des prix
            </h4>
            <div className="space-y-2">
              {listing.priceHistory.map((change, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{new Date(change.date).toLocaleDateString('fr-FR')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground line-through">
                      {change.previousPrice.toLocaleString('fr-FR')}€
                    </span>
                    <span className="text-priority-high font-medium">
                      {change.newPrice.toLocaleString('fr-FR')}€ ({change.percentChange.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Key info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Home className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium text-foreground">{listing.propertyType}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <span className="text-sm font-bold text-muted-foreground">{listing.rooms || '-'}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pièces</p>
              <p className="font-medium text-foreground">{listing.rooms || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">En ligne depuis</p>
              <p className="font-medium text-foreground">{listing.daysOnline} jours</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              listing.dpeClass === 'F' || listing.dpeClass === 'G' 
                ? 'bg-priority-high/10' 
                : 'bg-secondary'
            }`}>
              <span className={`text-sm font-bold ${
                listing.dpeClass === 'F' || listing.dpeClass === 'G' 
                  ? 'text-priority-high' 
                  : 'text-muted-foreground'
              }`}>{listing.dpeClass}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">DPE</p>
              <p className="font-medium text-foreground">Classe {listing.dpeClass}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Score breakdown */}
        <ScoreBreakdown listing={listing} />

        <Separator />

        {/* Description */}
        <div>
          <h4 className="panel-header mb-2">Description</h4>
          <p className="text-sm text-foreground leading-relaxed">{listing.description}</p>
        </div>

        <Separator />

        {/* Actions */}
        <div>
          <h4 className="panel-header mb-3">Préparer la prise de contact</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => setShowMessageGenerator('email')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Générer un email
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => setShowMessageGenerator('sms')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Générer un SMS
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => setShowMessageGenerator('call_script')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Script d'appel
            </Button>
          </div>
        </div>

        {/* View original */}
        {listing.url && (
          <Button variant="secondary" className="w-full" asChild>
            <a href={listing.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir l'annonce sur {listing.platform}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
