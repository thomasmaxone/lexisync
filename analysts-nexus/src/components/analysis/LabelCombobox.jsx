import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const RELATIONSHIP_LABELS = [
  'Controls / Command',
  'Funds / Finances',
  'Supplies / Logistics',
  'Communicates With',
  'Family / Blood Tie',
  'Associate / Known Associate',
  'Owns / Beneficial Owner',
  'Travels To',
  'Meets With',
  'Recruits',
  'Reports To',
  'Suspected Of',
  'Confirmed Link',
];

const ENTITY_LABELS = [
  'Person of Interest',
  'Subject',
  'Target',
  'Source / Informant',
  'Leader / Commander',
  'Facilitator',
  'Financier',
  'Operator',
  'Safehouse',
  'Front Company',
  'Shell Company',
  'Weapons Cache',
  'Money Laundering Vehicle',
];

export default function LabelCombobox({ value, onChange, isRelationship = false }) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const labels = isRelationship ? RELATIONSHIP_LABELS : ENTITY_LABELS;
  const groupLabel = isRelationship ? 'Relationships' : 'Entity Types';

  const handleSelect = (selectedLabel) => {
    onChange(selectedLabel);
    setOpen(false);
    setSearchValue('');
  };

  const filteredLabels = labels.filter(label =>
    label.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{value || 'Select or type label...'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or type custom label..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {searchValue && !labels.includes(searchValue) && (
              <CommandGroup heading="Custom">
                <CommandItem
                  value={searchValue}
                  onSelect={() => handleSelect(searchValue)}
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Use "{searchValue}"
                </CommandItem>
              </CommandGroup>
            )}
            {filteredLabels.length > 0 ? (
              <CommandGroup heading={groupLabel}>
                {filteredLabels.map((label) => (
                  <CommandItem
                    key={label}
                    value={label}
                    onSelect={() => handleSelect(label)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === label ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : searchValue ? null : (
              <CommandEmpty>No labels found</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}