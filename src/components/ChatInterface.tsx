import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, ScoredListing } from '@/types/listing';
import { queryListings, parseUserQuery, generateResponseText } from '@/services/listingService';
import { ListingCard } from './ListingCard';
import { ArrowUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  onSelectListing: (listing: ScoredListing) => void;
  selectedListingId?: string;
}

const WELCOME_MESSAGE: ChatMessageType = {
  id: 'welcome',
  role: 'assistant',
  content: `Bonjour, je suis votre assistant mandat.ai.

Je peux vous aider à trouver les mandats prioritaires, filtrer par critères, analyser les signaux et préparer vos prises de contact.

Que souhaitez-vous explorer ?`,
  timestamp: new Date()
};

const SUGGESTION_QUERIES = [
  "Mandats les plus chauds",
  "DPE F/G avec baisse de prix",
  "Particuliers > 60 jours"
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

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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
        content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
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
      {/* Header - minimal */}
      <div className="flex-shrink-0 px-8 py-5 flex items-center justify-between">
        <h1 className="font-serif text-xl text-foreground tracking-tight">mandat.ai</h1>
        <button 
          onClick={handleReset}
          className="text-muted-foreground hover:text-foreground transition-colors p-2"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-8 py-4 scrollbar-thin">
        <div className="max-w-2xl mx-auto space-y-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'animate-fade-in',
                message.role === 'user' ? 'flex justify-end' : ''
              )}
            >
              <div className={cn(
                message.role === 'user' ? 'max-w-[80%]' : 'w-full'
              )}>
                <div className={cn(
                  'text-sm leading-relaxed',
                  message.role === 'user' 
                    ? 'chat-bubble-user' 
                    : 'chat-bubble-assistant py-0'
                )}>
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }}
                  />
                </div>
                
                {/* Listings results */}
                {message.listings && message.listings.length > 0 && (
                  <div className="mt-6 space-y-3">
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
            <div className="animate-fade-in">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:150ms]" />
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions - only show at start */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 px-8 pb-4">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-2 justify-center">
            {SUGGESTION_QUERIES.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSubmit(query)}
                className="px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-300"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area - pill style */}
      <div className="flex-shrink-0 px-8 pb-8 pt-4">
        <div className="max-w-2xl mx-auto">
          <div className="chat-input-container flex items-center gap-3 px-5 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Décrivez ce que vous cherchez..."
              className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[24px] max-h-[100px]"
              rows={1}
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                input.trim() 
                  ? "bg-foreground text-background" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
