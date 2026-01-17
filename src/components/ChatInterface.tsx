import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, ScoredListing } from '@/types/listing';
import { queryListings, parseUserQuery, generateResponseText } from '@/services/listingService';
import { ListingCard } from './ListingCard';
import { Send, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  onSelectListing: (listing: ScoredListing) => void;
  selectedListingId?: string;
}

const WELCOME_MESSAGE: ChatMessageType = {
  id: 'welcome',
  role: 'assistant',
  content: `Bonjour ! Je suis votre assistant mandat.ai. Je peux vous aider à :

• **Trouver les mandats prioritaires** - "Montre-moi les mandats les plus chauds"
• **Filtrer par critères** - "Annonces DPE F/G à Lyon", "Baisses de prix récentes"
• **Analyser les signaux** - Chaque annonce est scorée automatiquement
• **Préparer vos prises de contact** - Emails, SMS, scripts d'appel personnalisés

Que souhaitez-vous explorer ?`,
  timestamp: new Date()
};

const SUGGESTION_QUERIES = [
  "Montre-moi les mandats les plus chauds",
  "Annonces DPE F/G avec baisse de prix",
  "Particuliers à Lyon > 60 jours"
];

export function ChatInterface({ onSelectListing, selectedListingId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (query?: string) => {
    const messageText = query || input.trim();
    if (!messageText || isLoading) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Parse query and fetch results
    const parsed = parseUserQuery(messageText);
    
    try {
      const listings = await queryListings(parsed.filters);
      const responseText = generateResponseText(parsed.intent, listings, parsed.filters);

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        listings: listings.length > 0 ? listings : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Désolé, une erreur s'est produite lors de la recherche. Veuillez réessayer.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">mandat.ai</h1>
            <p className="text-xs text-muted-foreground">Assistant de prospection immobilière</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex animate-slide-up',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div className={cn(
              'max-w-[85%]',
              message.role === 'user' ? 'order-2' : 'order-1'
            )}>
              <div className={cn(
                message.role === 'user' 
                  ? 'chat-bubble-user' 
                  : 'chat-bubble-assistant'
              )}>
                <div 
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }}
                />
              </div>
              
              {/* Listings results */}
              {message.listings && message.listings.length > 0 && (
                <div className="mt-4 space-y-3">
                  {message.listings.map(listing => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isSelected={listing.id === selectedListingId}
                      onClick={() => onSelectListing(listing)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="chat-bubble-assistant">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions - only show at start */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 px-6 pb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTION_QUERIES.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSubmit(query)}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 px-6 pb-6">
        <div className="chat-input-container flex items-end gap-3 p-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez ce que vous cherchez..."
            className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[24px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Appuyez sur Entrée pour envoyer • Version MVP sans IA
        </p>
      </div>
    </div>
  );
}
