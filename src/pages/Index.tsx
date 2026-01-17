import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { ListingDetailPanel } from '@/components/ListingDetailPanel';
import { ScoredListing } from '@/types/listing';

const Index = () => {
  const [selectedListing, setSelectedListing] = useState<ScoredListing | null>(null);

  const handleSelectListing = (listing: ScoredListing) => {
    setSelectedListing(listing);
  };

  const handleClosePanel = () => {
    setSelectedListing(null);
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Chat area - left side */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        <ChatInterface 
          onSelectListing={handleSelectListing}
          selectedListingId={selectedListing?.id}
        />
      </div>

      {/* Workspace panel - right side (always visible on desktop) */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0">
        <ListingDetailPanel 
          listing={selectedListing}
          onClose={handleClosePanel}
        />
      </div>

      {/* Mobile panel - slides in */}
      <div 
        className={`
          lg:hidden fixed right-0 top-0 h-full w-full max-w-[400px] bg-workspace
          transform transition-transform duration-300 ease-out z-50
          ${selectedListing ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <ListingDetailPanel 
          listing={selectedListing}
          onClose={handleClosePanel}
        />
      </div>

      {/* Overlay for mobile */}
      {selectedListing && (
        <div 
          className="fixed inset-0 bg-foreground/10 z-40 lg:hidden"
          onClick={handleClosePanel}
        />
      )}
    </div>
  );
};

export default Index;
