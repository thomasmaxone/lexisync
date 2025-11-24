import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Check, X, Edit2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function AISuggestionsPanel({ 
  suggestions, 
  onAccept, 
  onReject, 
  onModify,
  onClose,
  loading,
  error
}) {
  if (loading) {
    return (
      <div className="w-96 flex-shrink-0 border-l flex items-center justify-center bg-white border-slate-200">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-600">Analyzing entities...</p>
          <p className="text-xs mt-1 text-slate-400">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-96 flex-shrink-0 border-l flex items-center justify-center bg-white border-slate-200">
        <div className="text-center p-6">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm mb-2 text-slate-600">Failed to generate suggestions</p>
          <p className="text-xs text-slate-400">{error}</p>
          <Button 
            onClick={onClose} 
            size="sm" 
            className="mt-4 bg-slate-900 hover:bg-slate-800 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 flex-shrink-0 border-l flex flex-col bg-white border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">AI Suggestions</h2>
              <p className="text-xs text-slate-500">
                {suggestions.length} relationship{suggestions.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-600">No relationships suggested</p>
              <p className="text-xs mt-1 text-slate-400">
                Try adding more entities with descriptions
              </p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <Card key={index} className="p-3 transition-colors border-slate-200 hover:border-slate-300">
                <div className="space-y-2">
                  {/* Entities */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium truncate text-slate-700">
                      {suggestion.source_name}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="font-medium truncate text-slate-700">
                      {suggestion.target_name}
                    </span>
                  </div>

                  {/* Relationship */}
                  <div className="rounded-md p-2 bg-slate-50">
                    <div className="text-xs mb-1 text-slate-500">Relationship</div>
                    <div className="font-medium text-sm text-slate-900">
                      {suggestion.label}
                    </div>
                    {suggestion.relationship_type && (
                      <div className="text-xs mt-1 text-slate-500">
                        Type: {suggestion.relationship_type}
                      </div>
                    )}
                  </div>

                  {/* Reasoning */}
                  {suggestion.reasoning && (
                    <p className="text-xs leading-relaxed text-slate-600">
                      {suggestion.reasoning}
                    </p>
                  )}

                  {/* Confidence */}
                  {suggestion.confidence && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            suggestion.confidence >= 0.8 ? "bg-green-500" :
                            suggestion.confidence >= 0.5 ? "bg-yellow-500" :
                            "bg-orange-500"
                          )}
                          style={{ width: `${suggestion.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs w-12 text-right text-slate-500">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => onAccept(suggestion)}
                      className="flex-1 h-8 bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onModify(suggestion)}
                      className="h-8"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReject(index)}
                      className="h-8 text-slate-500 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {suggestions.length > 0 && (
        <div className="p-4 border-t border-slate-200">
          <Button
            onClick={() => {
              suggestions.forEach(suggestion => onAccept(suggestion));
            }}
            size="sm"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Accept All
          </Button>
        </div>
      )}
    </div>
  );
}