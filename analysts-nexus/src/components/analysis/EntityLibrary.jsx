import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  User, Building2, MapPin, Calendar, Car, 
  Phone, Mail, FileText, Plus, Search 
} from 'lucide-react';
import { cn } from "@/lib/utils";

const ENTITY_TYPES = {
  person: { icon: User, color: '#3b82f6', label: 'Person' },
  organization: { icon: Building2, color: '#8b5cf6', label: 'Organization' },
  location: { icon: MapPin, color: '#10b981', label: 'Location' },
  event: { icon: Calendar, color: '#f59e0b', label: 'Event' },
  vehicle: { icon: Car, color: '#ef4444', label: 'Vehicle' },
  phone: { icon: Phone, color: '#06b6d4', label: 'Phone' },
  email: { icon: Mail, color: '#ec4899', label: 'Email' },
  document: { icon: FileText, color: '#64748b', label: 'Document' },
  relationship: { icon: null, color: '#64748b', label: 'Relationship', hidden: true }
};

export default function EntityLibrary({ entities, onSelectEntity, onCreateEntity, selectedEntityId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredEntities = entities.filter(entity => {
    if (entity.type === 'relationship') return false;
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || entity.type === filterType;
    return matchesSearch && matchesType;
  });

  const entityCounts = entities.filter(e => e.type !== 'relationship').reduce((acc, entity) => {
    acc[entity.type] = (acc[entity.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col border-r bg-slate-50 border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="text-sm font-semibold mb-3 text-slate-900">Entity Library</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Type Filters */}
      <div className="p-3 border-b border-slate-200 bg-white">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="h-7 text-xs"
            >
              All ({entities.filter(e => e.type !== 'relationship').length})
            </Button>
            {Object.entries(ENTITY_TYPES).filter(([_, config]) => !config.hidden).map(([type, config]) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
                className="h-7 text-xs whitespace-nowrap"
              >
                {config.icon ? (
                  <config.icon className="w-3 h-3 mr-1" />
                ) : (
                  <div className="w-3 h-3 mr-1 rounded-sm" style={{ backgroundColor: config.color }} />
                )}
                {entityCounts[type] || 0}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Entity List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredEntities.map((entity) => {
            const config = ENTITY_TYPES[entity.type] || { color: '#64748b', label: 'Unknown' };
            const Icon = config.icon;
            return (
              <button
                key={entity.id}
                onClick={() => onSelectEntity(entity)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all",
                  selectedEntityId === entity.id
                    ? "bg-white shadow-md ring-2 ring-slate-300"
                    : "bg-slate-100 hover:bg-white hover:shadow-sm"
                )}
                >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    {Icon ? (
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                    ) : (
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: config.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-slate-900">
                      {entity.name}
                    </div>
                    {entity.description && (
                      <div className="text-xs mt-1 line-clamp-2 text-slate-500">
                        {entity.description}
                      </div>
                    )}
                    <Badge
                      variant="secondary"
                      className="mt-2 text-xs"
                      style={{ 
                        backgroundColor: `${config.color}10`, 
                        color: config.color 
                      }}
                    >
                      {config.label}
                    </Badge>
                  </div>
                </div>
              </button>
            );
          })}
          {filteredEntities.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">
              No entities found
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Entity Button */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <Button
          onClick={onCreateEntity}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entity
        </Button>
      </div>
    </div>
  );
}

export { ENTITY_TYPES };