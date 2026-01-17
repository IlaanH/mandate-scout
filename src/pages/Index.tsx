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
      {/* Chat area - main interface */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedListing ? 'lg:mr-[400px]' : ''}`}>
        <ChatInterface 
          onSelectListing={handleSelectListing}
          selectedListingId={selectedListing?.id}
        />
      </div>

      {/* Context panel - listing details */}
      <div 
        className={`
          fixed right-0 top-0 h-full w-[400px] bg-card border-l border-border
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
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={handleClosePanel}
        />
      )}
    </div>
  );
};

export default Index;
