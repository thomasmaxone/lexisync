import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from "@/lib/utils";


export default function MultiEntryField({ fieldKey, subFields, value = [], onChange }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const addEntry = () => {
    const newEntry = {};
    subFields.forEach(field => {
      newEntry[field.key] = '';
    });
    onChange([...value, newEntry]);
    setExpandedIndex(value.length);
  };

  const removeEntry = (index) => {
    onChange(value.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const updateEntry = (index, fieldKey, fieldValue) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [fieldKey]: fieldValue };
    onChange(updated);
  };

  const getEntryLabel = (entry, index) => {
    // Try to find a meaningful label from the first non-empty field
    const labelField = subFields.find(f => entry[f.key]);
    return labelField ? entry[labelField.key] : `Entry ${index + 1}`;
  };

  return (
    <div className="space-y-2">
      {value.map((entry, index) => (
        <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between p-2 bg-slate-50 cursor-pointer hover:bg-slate-100"
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <div className="flex items-center gap-2">
              {expandedIndex === index ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-sm font-medium text-slate-700">
                {getEntryLabel(entry, index)}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                removeEntry(index);
              }}
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          
          {expandedIndex === index && (
            <div className="p-3 space-y-2 bg-white">
              {subFields.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={`${fieldKey}-${index}-${field.key}`} className="text-xs text-slate-600">
                    {field.label}
                  </Label>
                  {field.type === 'select' ? (
                    <Select
                      value={entry[field.key] || ''}
                      onValueChange={(val) => updateEntry(index, field.key, val)}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`${fieldKey}-${index}-${field.key}`}
                      type={field.type || 'text'}
                      value={entry[field.key] || ''}
                      onChange={(e) => updateEntry(index, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="mt-1 h-8 text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addEntry}
        className="w-full h-8 text-xs"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add {fieldKey}
      </Button>
    </div>
  );
}