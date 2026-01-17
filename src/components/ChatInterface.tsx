import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, ApiListing } from '@/types/listing';
import { sendMessage } from '@/services/chatApiService';
import { ArrowUp, RotateCcw, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  onSelectListing?: (listing: ApiListing) => void;
  selectedListingId?: string;
}

const SUGGESTION_QUERIES = [
  "Find me the 10 latest annonces for Paris",
  "Appartements à Lyon moins de 300000€",
  "Maisons avec jardin à Bordeaux"
];

export function ChatInterface({ onSelectListing, selectedListingId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isWelcomeState = messages.length === 0;

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

    try {
      const response = await sendMessage(messageText, conversationId);
      
      // Store conversation ID for context
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
        apiListings: response.listings
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('API Error:', error);
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
    setMessages([]);
    setConversationId(undefined);
  };

  // Listing card for API listings
  const ApiListingCard = ({ listing, index }: { listing: ApiListing; index: number }) => (
    <div 
      className="p-4 rounded-lg border border-border bg-card hover:border-foreground/20 transition-all cursor-pointer"
      onClick={() => onSelectListing?.(listing)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground mb-1">{listing.price}</div>
          <p className="text-sm text-muted-foreground line-clamp-2">{listing.details}</p>
        </div>
        {listing.phone && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            <Phone className="w-3 h-3" />
            {listing.phone}
          </div>
        )}
      </div>
    </div>
  );

  // Input component to reuse in both states
  const InputBar = ({ centered = false }: { centered?: boolean }) => (
    <div className={cn(
      "chat-input-container flex items-center gap-3 px-5 py-3",
      centered ? "w-full max-w-xl" : ""
    )}>
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
  );

  // Suggestions component to reuse
  const Suggestions = () => (
    <div className="flex flex-wrap gap-2 justify-center">
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
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header - slightly darker */}
      <div className="flex-shrink-0 px-8 py-5 flex items-center justify-between bg-secondary/50 border-b border-border/50">
        <h1 className="font-serif text-xl text-foreground tracking-tight">mandat.ai</h1>
        {!isWelcomeState && (
          <button 
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {isWelcomeState ? (
        /* Welcome State - Centered layout like Manus AI */
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Que puis-je faire pour vous ?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Ton assistant qui t'aide à gagner plus de mandats en centralisant les signaux marché et en les transformant en communication parfaitement timée.
            </p>
          </div>
          
          <div className="w-full max-w-xl mb-6">
            <InputBar centered />
          </div>
          
          <Suggestions />
        </div>
      ) : (
        /* Conversation State */
        <>
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
                    
                    {/* API Listings results */}
                    {message.apiListings && message.apiListings.length > 0 && (
                      <div className="mt-6 space-y-3">
                        {message.apiListings.map((listing, index) => (
                          <ApiListingCard key={index} listing={listing} index={index} />
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

          {/* Input area - bottom */}
          <div className="flex-shrink-0 px-8 pb-8 pt-4">
            <div className="max-w-2xl mx-auto">
              <InputBar />
            </div>
          </div>
        </>
      )}
    </div>
  );
}