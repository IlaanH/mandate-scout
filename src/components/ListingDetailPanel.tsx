import { ScoredListing } from '@/types/listing';
import { X, ExternalLink, Mail, MessageSquare, Phone, TrendingDown, Calendar, Home, MapPin } from 'lucide-react';
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
      <div className="context-panel p-8 flex flex-col items-center justify-center h-full">
        <div className="text-center max-w-xs">
          <h2 className="font-serif text-lg text-foreground mb-2">Espace de travail</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sélectionnez une annonce dans le chat pour afficher ses détails et préparer votre prise de contact.
          </p>
        </div>
      </div>
    );
  }

  const priceFormatted = new Intl.NumberFormat('fr-FR').format(listing.price);

  if (showMessageGenerator) {
    return (
      <div className="context-panel h-full animate-fade-in">
        <MessageGenerator 
          listing={listing} 
          type={showMessageGenerator} 
          onBack={() => setShowMessageGenerator(null)} 
        />
      </div>
    );
  }

  return (
    <div className="context-panel h-full overflow-y-auto scrollbar-thin animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 bg-workspace/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between z-10">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Détails
        </span>
        <button 
          onClick={onClose}
          className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-6 pb-8 space-y-8">
        {/* Image */}
        {listing.imageUrl && (
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
            <img 
              src={listing.imageUrl} 
              alt={`${listing.propertyType} à ${listing.city}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title and price */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{listing.platform}</span>
            <span>·</span>
            <span>{listing.sellerType}</span>
          </div>
          <h3 className="font-serif text-xl text-foreground">
            {listing.propertyType} {listing.surface}m²
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {listing.address || listing.city}, {listing.postalCode}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-medium text-foreground">{priceFormatted}€</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(listing.price / listing.surface).toLocaleString('fr-FR')}€/m²
            </span>
          </div>
        </div>

        {/* Price history */}
        {listing.priceHistory.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-priority-high">
              <TrendingDown className="w-4 h-4" />
              <span className="font-medium">Baisse de prix</span>
            </div>
            <div className="space-y-2 pl-6">
              {listing.priceHistory.map((change, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(change.date).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-muted-foreground">
                    {change.previousPrice.toLocaleString('fr-FR')}€ → {change.newPrice.toLocaleString('fr-FR')}€
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key info */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="text-foreground font-medium">{listing.propertyType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pièces</p>
            <p className="text-foreground font-medium">{listing.rooms || 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">En ligne</p>
            <p className="text-foreground font-medium">{listing.daysOnline} jours</p>
          </div>
          <div>
            <p className="text-muted-foreground">DPE</p>
            <p className={`font-medium ${
              listing.dpeClass === 'F' || listing.dpeClass === 'G' 
                ? 'text-priority-high' 
                : 'text-foreground'
            }`}>Classe {listing.dpeClass}</p>
          </div>
        </div>

        {/* Score breakdown */}
        <ScoreBreakdown listing={listing} />

        {/* Description */}
        <div className="space-y-3">
          <h4 className="panel-header">Description</h4>
          <p className="text-sm text-foreground leading-relaxed">{listing.description}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h4 className="panel-header">Prise de contact</h4>
          <div className="space-y-2">
            <button 
              onClick={() => setShowMessageGenerator('email')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4 text-muted-foreground" />
              Générer un email
            </button>
            <button 
              onClick={() => setShowMessageGenerator('sms')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Générer un SMS
            </button>
            <button 
              onClick={() => setShowMessageGenerator('call_script')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4 text-muted-foreground" />
              Script d'appel
            </button>
          </div>
        </div>

        {/* View original */}
        {listing.url && (
          <a 
            href={listing.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Voir sur {listing.platform}
          </a>
        )}
      </div>
    </div>
  );
}
