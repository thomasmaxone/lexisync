import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Command } from 'lucide-react';
import { ENTITY_TYPES } from './EntityLibrary';

// Fuzzy match scoring
const fuzzyMatch = (str, pattern) => {
  const strLower = str.toLowerCase();
  const patternLower = pattern.toLowerCase();
  
  // Exact match gets highest score
  if (strLower.includes(patternLower)) {
    return 100 - strLower.indexOf(patternLower);
  }
  
  // Fuzzy matching
  let score = 0;
  let patternIdx = 0;
  
  for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
    if (strLower[i] === patternLower[patternIdx]) {
      score += 10;
      patternIdx++;
    }
  }
  
  return patternIdx === patternLower.length ? score : 0;
};

export default function EntitySearchDialog({ isOpen, onClose, allEntities, currentCanvasId, onAddToCanvas }) {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredEntities = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return allEntities
        .filter(entity => entity.attributes?.canvas_id !== currentCanvasId)
        .slice(0, 50);
    }
    
    const term = searchTerm.trim();
    const scored = allEntities
      .filter(entity => entity.attributes?.canvas_id !== currentCanvasId)
      .map(entity => {
        const nameScore = fuzzyMatch(entity.name, term);
        const typeScore = fuzzyMatch(entity.type, term) * 0.8;
        const descScore = entity.description ? fuzzyMatch(entity.description, term) * 0.5 : 0;
        const labelScore = entity.attributes?.entity_label ? fuzzyMatch(entity.attributes.entity_label, term) * 0.7 : 0;
        const attrScore = Object.values(entity.attributes || {})
          .filter(v => typeof v === 'string')
          .reduce((acc, v) => Math.max(acc, fuzzyMatch(v, term) * 0.3), 0);
        
        const totalScore = nameScore + typeScore + descScore + labelScore + attrScore;
        
        return { entity, score: totalScore };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(({ entity }) => entity);
    
    return scored;
  }, [allEntities, currentCanvasId, searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0 bg-[#11141A] border-[#2D3742]">
        <DialogHeader className="px-6 py-4 border-b bg-[#181C24] border-[#2D3742]">
          <DialogTitle className="flex items-center gap-2 text-[#E2E8F0]">
            <Command className="w-5 h-5" />
            Global Entity Search
          </DialogTitle>
          <p className="text-xs text-[#94A3B8] mt-1">Search across all canvases with fuzzy matching</p>
        </DialogHeader>

        <div className="px-6 py-4 border-b bg-[#181C24] border-[#2D3742]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              ref={searchInputRef}
              placeholder="Type to search... (fuzzy matching enabled)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 text-base"
            />
          </div>
          <p className="text-xs text-[#94A3B8] mt-2">
            💡 Tip: Use partial words - "prof" finds "Profile", "usr" finds "User", etc.
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-3">
            {filteredEntities.length > 0 && (
              <div className="text-xs text-[#94A3B8] mb-3">
                Found {filteredEntities.length} result{filteredEntities.length !== 1 ? 's' : ''}
                {searchTerm && ` for "${searchTerm}"`}
              </div>
            )}
            
            {filteredEntities.map((entity) => {
              const config = ENTITY_TYPES[entity.type] || { color: '#64748b', label: 'Unknown' };
              const Icon = config?.icon;
              
              return (
                <div
                  key={entity.id}
                  className="group flex items-center justify-between p-4 rounded border border-[#2D3742] hover:border-[#00D4FF] hover:bg-[#1E2530] transition-all cursor-pointer"
                  onClick={() => onAddToCanvas(entity)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      {Icon && <Icon className="w-6 h-6" style={{ color: config.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#E2E8F0] truncate">
                        {entity.name}
                      </h3>
                      <p className="text-xs text-[#94A3B8] capitalize font-medium">
                        {entity.attributes?.entity_label || config.label}
                      </p>
                      {entity.description && (
                        <p className="text-xs text-[#94A3B8] truncate mt-1">
                          {entity.description}
                        </p>
                      )}
                      <p className="text-xs text-[#64748B] mt-1">
                        Canvas: {allEntities.find(e => e.attributes?.canvas_id === entity.attributes?.canvas_id) ? 
                          allEntities.filter(e => e.attributes?.canvas_id === entity.attributes?.canvas_id).length + ' entities' : 
                          'Other canvas'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="ml-3 flex-shrink-0 bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-[#0B0E13] opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Canvas
                  </Button>
                </div>
              );
            })}
            
            {filteredEntities.length === 0 && searchTerm && (
              <div className="py-12 text-center text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No matches found</p>
                <p className="text-xs mt-2">Try different keywords or check spelling</p>
              </div>
            )}
            
            {filteredEntities.length === 0 && !searchTerm && (
              <div className="py-12 text-center text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Start typing to search all entities</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}