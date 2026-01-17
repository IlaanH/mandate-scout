import { ScoredListing } from '@/types/listing';
import { cn } from '@/lib/utils';

interface ScoreBreakdownProps {
  listing: ScoredListing;
}

export function ScoreBreakdown({ listing }: ScoreBreakdownProps) {
  const maxScore = 150;
  const scorePercentage = Math.min((listing.score / maxScore) * 100, 100);

  const categoryLabels: Record<string, string> = {
    'age': 'Ancienneté',
    'price': 'Prix',
    'dpe': 'Énergie',
    'seller': 'Vendeur',
    'combo': 'Combinaison'
  };

  // Group signals by category
  const signalsByCategory = listing.signals.reduce((acc, signal) => {
    const cat = signal.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(signal);
    return acc;
  }, {} as Record<string, typeof listing.signals>);

  return (
    <div className="space-y-4">
      <h4 className="panel-header">Analyse</h4>
      
      {/* Score bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">Score {listing.score}</span>
          <span className={cn(
            'text-xs',
            listing.priority === 'High' && 'priority-badge-high',
            listing.priority === 'Medium' && 'priority-badge-medium',
            listing.priority === 'Low' && 'priority-badge-low'
          )}>
            Priorité {listing.priority === 'High' ? 'haute' : listing.priority === 'Medium' ? 'moyenne' : 'basse'}
          </span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-foreground rounded-full transition-all duration-500"
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </div>

      {/* Explanation */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {listing.explanation}
      </p>

      {/* Signals breakdown */}
      {listing.signals.length > 0 && (
        <div className="space-y-4 pt-2">
          {Object.entries(signalsByCategory).map(([category, signals]) => (
            <div key={category} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {categoryLabels[category] || category}
              </p>
              {signals.map(signal => (
                <div 
                  key={signal.id} 
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="text-foreground">{signal.label}</p>
                    <p className="text-xs text-muted-foreground">{signal.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    +{signal.weight}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {listing.signals.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Aucun signal fort détecté.
        </p>
      )}
    </div>
  );
}
