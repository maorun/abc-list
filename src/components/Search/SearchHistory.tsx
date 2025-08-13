import React from 'react';
import { Clock, Search, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchHistory as SearchHistoryType } from '@/lib/searchService';

interface SearchHistoryProps {
  history: SearchHistoryType[];
  onHistoryClick: (query: string) => void;
  onClearHistory: () => void;
  onSwitchToSearch: () => void;
}

export function SearchHistory({ 
  history, 
  onHistoryClick, 
  onClearHistory, 
  onSwitchToSearch 
}: SearchHistoryProps) {
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Gerade eben';
    if (minutes < 60) return `vor ${minutes} Min`;
    if (hours < 24) return `vor ${hours} Std`;
    if (days < 7) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    
    return new Date(timestamp).toLocaleDateString('de-DE');
  };

  const getFrequentQueries = () => {
    const queryCount = new Map<string, number>();
    
    history.forEach(item => {
      const query = item.query.toLowerCase().trim();
      if (query.length > 1) {
        queryCount.set(query, (queryCount.get(query) || 0) + 1);
      }
    });

    return Array.from(queryCount.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));
  };

  const handleQueryClick = (query: string) => {
    onHistoryClick(query);
    onSwitchToSearch();
  };

  const recentHistory = history.slice(0, 20);
  const frequentQueries = getFrequentQueries();

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Noch keine Suchverlauf</h3>
        <p className="text-sm">
          Deine Suchanfragen werden hier gespeichert, um dir häufige Begriffe anzuzeigen
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Suchverlauf</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearHistory}
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          Verlauf löschen
        </Button>
      </div>

      {/* Frequent queries */}
      {frequentQueries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <h3 className="font-medium text-gray-700">Häufige Suchanfragen</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {frequentQueries.map(({ query, count }) => (
              <button
                key={query}
                onClick={() => handleQueryClick(query)}
                className="flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Search className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <span className="font-medium text-gray-900 truncate">
                    {query}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                  {count}x
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent history */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <h3 className="font-medium text-gray-700">Letzte Suchanfragen</h3>
        </div>
        
        <div className="space-y-2">
          {recentHistory.map((item, index) => (
            <button
              key={`${item.query}-${item.timestamp}-${index}`}
              onClick={() => handleQueryClick(item.query)}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 border rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Search className="h-4 w-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 truncate block">
                    {item.query}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{formatTimeAgo(item.timestamp)}</span>
                    {item.resultCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{item.resultCount} Ergebnisse</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {item.resultCount > 0 && (
                <Badge variant="outline" className="ml-2">
                  {item.resultCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick search suggestions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">💡 Suchtipps</h4>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• Verwende Anführungszeichen für exakte Suchen: "Mathematik Formeln"</p>
          <p>• Nutze Tags um nach Kategorien zu suchen: #Lernen oder #Prüfung</p>
          <p>• Kombiniere Filter für präzisere Ergebnisse</p>
          <p>• Häufige Begriffe werden automatisch vorgeschlagen</p>
        </div>
      </div>

      {/* Statistics */}
      {history.length > 0 && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Statistiken</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {history.length}
              </div>
              <div className="text-gray-600">Suchanfragen</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {new Set(history.map(h => h.query.toLowerCase())).size}
              </div>
              <div className="text-gray-600">Eindeutige Begriffe</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(history.reduce((sum, h) => sum + h.resultCount, 0) / history.length)}
              </div>
              <div className="text-gray-600">⌀ Ergebnisse</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {frequentQueries.length}
              </div>
              <div className="text-gray-600">Häufige Begriffe</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}