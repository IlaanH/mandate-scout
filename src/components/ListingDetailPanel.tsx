import { ApiListing } from '@/types/listing';
import { X, Phone, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ListingDetailPanelProps {
  listing: ApiListing | null;
  onClose: () => void;
}

export function ListingDetailPanel({ listing, onClose }: ListingDetailPanelProps) {
  const [copied, setCopied] = useState(false);

  const copyPhone = async () => {
    if (listing?.phone) {
      await navigator.clipboard.writeText(listing.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!listing) {
    return (
      <div className="context-panel p-8 flex flex-col items-center justify-center h-full">
        <div className="text-center max-w-xs">
          <h2 className="font-serif text-lg text-foreground mb-2">Espace de travail</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sélectionnez une annonce dans le chat pour afficher ses détails.
          </p>
        </div>
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

      <div className="px-6 pb-8 space-y-6">
        {/* Price */}
        <div className="space-y-2">
          <h3 className="font-serif text-2xl text-foreground">
            {listing.price}
          </h3>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <h4 className="panel-header">Détails</h4>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {listing.details}
          </p>
        </div>

        {/* Phone */}
        {listing.phone && (
          <div className="space-y-3">
            <h4 className="panel-header">Contact</h4>
            <button
              onClick={copyPhone}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-foreground bg-muted hover:bg-accent rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{listing.phone}</span>
              </div>
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}