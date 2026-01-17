import { useState } from 'react';
import { ScoredListing, MessageType } from '@/types/listing';
import { generateMessage, saveMessage } from '@/services/messageService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, Check, Save, Mail, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface MessageGeneratorProps {
  listing: ScoredListing;
  type: MessageType;
  onBack: () => void;
}

export function MessageGenerator({ listing, type, onBack }: MessageGeneratorProps) {
  const initialMessage = generateMessage(listing, type);
  
  const [subject, setSubject] = useState(initialMessage.subject || '');
  const [content, setContent] = useState(initialMessage.content);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const typeLabels: Record<MessageType, { label: string; icon: React.ReactNode }> = {
    email: { label: 'Email', icon: <Mail className="w-4 h-4" /> },
    sms: { label: 'SMS', icon: <MessageSquare className="w-4 h-4" /> },
    call_script: { label: 'Script d\'appel', icon: <Phone className="w-4 h-4" /> }
  };

  const handleCopy = async () => {
    const textToCopy = type === 'email' ? `Objet: ${subject}\n\n${content}` : content;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveMessage({
      ...initialMessage,
      subject: type === 'email' ? subject : undefined,
      content
    });
    setSaved(true);
    toast.success('Message sauvegardé');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRegenerate = () => {
    const newMessage = generateMessage(listing, type);
    setSubject(newMessage.subject || '');
    setContent(newMessage.content);
    toast.info('Message régénéré');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          {typeLabels[type].icon}
          <h2 className="font-semibold text-foreground">{typeLabels[type].label}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {/* Context banner */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Généré pour</p>
          <p className="text-sm font-medium text-foreground">
            {listing.propertyType} {listing.surface}m² - {listing.city}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {listing.signals.slice(0, 3).map(s => (
              <span key={s.id} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Email subject */}
        {type === 'email' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Objet
            </label>
            <Input 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-card"
            />
          </div>
        )}

        {/* Message content */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {type === 'call_script' ? 'Script' : 'Message'}
          </label>
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] bg-card font-mono text-sm resize-none"
          />
        </div>

        {/* Word/char count */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{content.length} caractères</span>
          {type === 'sms' && (
            <span className={content.length > 160 ? 'text-priority-medium' : ''}>
              {Math.ceil(content.length / 160)} SMS
            </span>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleRegenerate}>
          Régénérer
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleSave}>
          {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saved ? 'Sauvegardé' : 'Sauvegarder'}
        </Button>
        <Button size="sm" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copié' : 'Copier'}
        </Button>
      </div>
    </div>
  );
}
