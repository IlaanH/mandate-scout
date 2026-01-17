import { ScoredListing } from '@/types/listing';
import { cn } from '@/lib/utils';
import { Zap, TrendingUp } from 'lucide-react';

interface ScoreBreakdownProps {
  listing: ScoredListing;
}

export function ScoreBreakdown({ listing }: ScoreBreakdownProps) {
  const maxScore = 150; // Approximate max possible score
  const scorePercentage = Math.min((listing.score / maxScore) * 100, 100);

  const priorityColors = {
    'High': 'from-score-hot to-priority-medium',
    'Medium': 'from-priority-medium to-priority-low',
    'Low': 'from-score-cool to-priority-low'
  };

  const categoryLabels: Record<string, string> = {
    'age': 'Ancienneté',
    'price': 'Prix',
    'dpe': 'Performance énergétique',
    'seller': 'Type de vendeur',
    'combo': 'Combinaison'
  };

  const categoryColors: Record<string, string> = {
    'age': 'bg-score-cool',
    'price': 'bg-priority-high',
    'dpe': 'bg-priority-medium',
    'seller': 'bg-primary',
    'combo': 'bg-gradient-to-r from-primary to-priority-medium'
  };

  // Group signals by category
  const signalsByCategory = listing.signals.reduce((acc, signal) => {
    const cat = signal.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(signal);
    return acc;
  }, {} as Record<string, typeof listing.signals>);

  return (
    <div>
      <h4 className="panel-header mb-3">Analyse du potentiel</h4>
      
      {/* Score bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Score: {listing.score}</span>
          </div>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            listing.priority === 'High' && 'priority-badge-high',
            listing.priority === 'Medium' && 'priority-badge-medium',
            listing.priority === 'Low' && 'priority-badge-low'
          )}>
            Priorité {listing.priority}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', priorityColors[listing.priority])}
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-secondary/50 rounded-lg p-3 mb-4">
        <p className="text-sm text-foreground">{listing.explanation}</p>
      </div>

      {/* Signals breakdown */}
      {listing.signals.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Signaux détectés
          </h5>
          {Object.entries(signalsByCategory).map(([category, signals]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', categoryColors[category])} />
                <span className="text-xs font-medium text-muted-foreground">
                  {categoryLabels[category] || category}
                </span>
              </div>
              {signals.map(signal => (
                <div 
                  key={signal.id} 
                  className="ml-4 flex items-start gap-2 bg-card border border-border rounded-lg p-3"
                >
                  <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{signal.label}</p>
                    <p className="text-xs text-muted-foreground">{signal.description}</p>
                    <span className="inline-block mt-1 text-xs font-medium text-primary">
                      +{signal.weight} points
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {listing.signals.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Aucun signal fort détecté pour cette annonce.
        </p>
      )}
    </div>
  );
}
