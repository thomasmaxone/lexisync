import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowRight, ArrowLeftRight, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

const LINK_CATEGORIES = {
  'Employment & Corporate Roles': [
    { label: 'Employed By', reverse: 'Employs', bidirectional: false },
    { label: 'Director Of', reverse: 'Has Director', bidirectional: false },
    { label: 'CEO Of', reverse: 'Has CEO', bidirectional: false },
    { label: 'Founder Of', reverse: 'Founded By', bidirectional: false },
    { label: 'Board Member Of', reverse: 'Has Board Member', bidirectional: false },
    { label: 'Shareholder Of', reverse: 'Has Shareholder', bidirectional: false },
    { label: 'Beneficial Owner Of', reverse: 'Beneficially Owned By', bidirectional: false },
    { label: 'Authorised Signatory For', reverse: 'Has Signatory', bidirectional: false },
    { label: 'Contractor For', reverse: 'Contracts', bidirectional: false },
    { label: 'Former Employee Of', reverse: 'Former Employer', bidirectional: false }
  ],
  'Family & Personal': [
    { label: 'Spouse Of', reverse: 'Spouse Of', bidirectional: true },
    { label: 'Parent Of', reverse: 'Child Of', bidirectional: false },
    { label: 'Sibling Of', reverse: 'Sibling Of', bidirectional: true },
    { label: 'Relative Of', reverse: 'Relative Of', bidirectional: true },
    { label: 'Co-habits With', reverse: 'Co-habits With', bidirectional: true },
    { label: 'Romantic Partner', reverse: 'Romantic Partner', bidirectional: true },
    { label: 'Friend Of', reverse: 'Friend Of', bidirectional: true },
    { label: 'Known Associate', reverse: 'Known Associate', bidirectional: true }
  ],
  'Ownership & Control': [
    { label: 'Owns', reverse: 'Owned By', bidirectional: false },
    { label: 'Controls', reverse: 'Controlled By', bidirectional: false },
    { label: 'Registered Owner Of', reverse: 'Registered To', bidirectional: false },
    { label: 'Beneficial Owner Of', reverse: 'Beneficially Owned By', bidirectional: false },
    { label: 'Nominee For', reverse: 'Nominee Owner', bidirectional: false },
    { label: 'Trustee Of', reverse: 'Held In Trust By', bidirectional: false }
  ],
  'Financial & Transactions': [
    { label: 'Pays', reverse: 'Paid By', bidirectional: false },
    { label: 'Transfers Funds To', reverse: 'Receives Funds From', bidirectional: false },
    { label: 'Sends Crypto To', reverse: 'Receives Crypto From', bidirectional: false },
    { label: 'Account Holder Of', reverse: 'Has Account Holder', bidirectional: false },
    { label: 'Loan To', reverse: 'Loan From', bidirectional: false },
    { label: 'Guarantor For', reverse: 'Guaranteed By', bidirectional: false }
  ],
  'Criminal & Illicit': [
    { label: 'Co-Offender With', reverse: 'Co-Offender With', bidirectional: true },
    { label: 'Member Of', reverse: 'Has Member', bidirectional: false },
    { label: 'Leader Of', reverse: 'Led By', bidirectional: false },
    { label: 'Supplier To (Illicit)', reverse: 'Customer Of (Illicit)', bidirectional: false },
    { label: 'Recruits', reverse: 'Recruited By', bidirectional: false },
    { label: 'Traffics With', reverse: 'Traffics With', bidirectional: true }
  ],
  'Communications': [
    { label: 'Calls', reverse: 'Called By', bidirectional: false },
    { label: 'Messages', reverse: 'Messaged By', bidirectional: false },
    { label: 'Emails', reverse: 'Emailed By', bidirectional: false },
    { label: 'Follows (Social)', reverse: 'Followed By', bidirectional: false },
    { label: 'Mentions', reverse: 'Mentioned By', bidirectional: false }
  ],
  'Location & Presence': [
    { label: 'Resides At', reverse: 'Resident', bidirectional: false },
    { label: 'Works At', reverse: 'Employee At', bidirectional: false },
    { label: 'Visited', reverse: 'Visitor', bidirectional: false },
    { label: 'Seen With', reverse: 'Seen With', bidirectional: true },
    { label: 'Travelled With', reverse: 'Travelled With', bidirectional: true }
  ],
  'Legal & Regulatory': [
    { label: 'Suspect In', reverse: 'Has Suspect', bidirectional: false },
    { label: 'Victim Of', reverse: 'Victimised', bidirectional: false },
    { label: 'Witness In', reverse: 'Has Witness', bidirectional: false },
    { label: 'Charged With', reverse: 'Charged', bidirectional: false },
    { label: 'Convicted Of', reverse: 'Convicted', bidirectional: false }
  ],
  'Corporate Registry': [
    { label: 'Subsidiary Of', reverse: 'Parent Company Of', bidirectional: false },
    { label: 'Acquired By', reverse: 'Acquired', bidirectional: false },
    { label: 'Supplier To', reverse: 'Customer Of', bidirectional: false },
    { label: 'Joint Venture With', reverse: 'Joint Venture With', bidirectional: true }
  ],
  'Other Common': [
    { label: 'Knows', reverse: 'Known By', bidirectional: false },
    { label: 'Meets', reverse: 'Met By', bidirectional: false },
    { label: 'Reports To', reverse: 'Supervises', bidirectional: false },
    { label: 'Same Address As', reverse: 'Same Address As', bidirectional: true },
    { label: 'Same Phone As', reverse: 'Same Phone As', bidirectional: true },
    { label: 'Refers', reverse: 'Referred By', bidirectional: false }
  ]
};

export default function CreateLinkDialog({ isOpen, onClose, sourceEntity, targetEntity, onCreateLink }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const searchInputRef = useRef(null);

  // Auto-focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset on close
  const handleClose = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setCollapsedCategories(new Set());
    onClose();
  };

  // Toggle category collapse
  const toggleCategory = (category) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  // Filter links by search term
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm.trim()) return LINK_CATEGORIES;
    
    const term = searchTerm.toLowerCase();
    const filtered = {};
    
    Object.entries(LINK_CATEGORIES).forEach(([category, links]) => {
      const matchingLinks = links.filter(link => 
        link.label.toLowerCase().includes(term) ||
        link.reverse.toLowerCase().includes(term)
      );
      if (matchingLinks.length > 0) {
        filtered[category] = matchingLinks;
      }
    });
    
    return filtered;
  }, [searchTerm]);

  // Get links to display
  const displayedLinks = React.useMemo(() => {
    if (selectedCategory) {
      return filteredCategories[selectedCategory] || [];
    }
    // Show all filtered links when no category selected
    return Object.values(filteredCategories).flat();
  }, [selectedCategory, filteredCategories]);

  const handleSelectLink = (link) => {
    onCreateLink({
      label: link.label,
      reverseLabel: link.reverse,
      bidirectional: link.bidirectional,
      direction: link.bidirectional ? 'bidirectional' : 'directed'
    });
    handleClose();
  };

  if (!sourceEntity || !targetEntity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[75vh] p-0 gap-0 bg-[#11141A] border-[#2D3742]">
        <DialogHeader className="px-6 py-4 border-b border-[#2D3742] bg-[#181C24]">
          <DialogTitle className="text-xl font-semibold text-[#E2E8F0]">Create Link</DialogTitle>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#181C24] border border-[#2D3742] rounded">
              <span className="text-sm font-medium text-[#E2E8F0]">{sourceEntity.name}</span>
            </div>
            <ArrowRight className="w-5 h-5 text-[#00D4FF]" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
              <span className="text-sm font-medium text-slate-900">{targetEntity.name}</span>
            </div>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 py-3 border-b bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              ref={searchInputRef}
              placeholder="Quick search relationships... (e.g., 'employs', 'owns', 'calls')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Categories */}
          <div className="w-72 border-r border-[#2D3742] bg-[#181C24] flex flex-col">
            <div className="px-4 py-3 border-b">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedCategory === null
                    ? "bg-[#1E293B] text-[#00D4FF] border-l-2 border-[#00D4FF]"
                    : "text-[#E2E8F0] hover:bg-[#1E2530]"
                )}
              >
                All Relationships
              </button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {Object.keys(filteredCategories).map((category) => {
                  const isCollapsed = collapsedCategories.has(category);
                  const categoryLinks = filteredCategories[category];
                  
                  return (
                    <div key={category}>
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium text-[#E2E8F0] hover:bg-[#1E2530] transition-colors"
                      >
                        <span>{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#94A3B8]">
                            {categoryLinks.length}
                          </span>
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                          )}
                        </div>
                      </button>
                      {!isCollapsed && (
                        <div className="ml-3 mt-1 space-y-1">
                          {categoryLinks.map((link, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectLink(link)}
                              className="w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 text-[#E2E8F0] hover:bg-[#1E2530] hover:text-[#00D4FF]"
                            >
                              {link.bidirectional ? (
                                <ArrowLeftRight className="w-3.5 h-3.5 text-[#00D4FF] flex-shrink-0" />
                              ) : (
                                <ArrowRight className="w-3.5 h-3.5 text-[#00D4FF] flex-shrink-0" />
                              )}
                              <span className="truncate">{link.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right - Link Selection Grid */}
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-3 border-b border-[#2D3742] bg-[#181C24]">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">
                {selectedCategory || 'All Relationships'} 
                <span className="ml-2 text-[#94A3B8] font-normal">
                  ({displayedLinks.length} available)
                </span>
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6 grid grid-cols-2 gap-3">
                {displayedLinks.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectLink(link)}
                    className="group relative p-4 rounded border border-[#2D3742] hover:border-[#00D4FF] hover:bg-[#1E2530] transition-all text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {link.bidirectional ? (
                            <ArrowLeftRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#00D4FF] flex-shrink-0" />
                          ) : (
                            <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#00D4FF] flex-shrink-0" />
                          )}
                          <span className="text-sm font-semibold text-[#E2E8F0] truncate">
                            {link.label}
                          </span>
                        </div>
                        {!link.bidirectional && (
                          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                            <ArrowRight className="w-3 h-3 rotate-180 flex-shrink-0" />
                            <span className="truncate">{link.reverse}</span>
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-medium transition-colors",
                        link.bidirectional 
                          ? "bg-[#181C24] text-[#00D4FF] border border-[#00D4FF]" 
                          : "bg-[#181C24] text-[#00D4FF] border border-[#00D4FF]"
                      )}>
                        {link.bidirectional ? '↔' : '→'}
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="mt-3 pt-3 border-t border-[#2D3742] group-hover:border-[#00D4FF]">
                      <div className="text-xs text-[#94A3B8] space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{sourceEntity.name}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-[#E2E8F0]">{link.label}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-medium">{targetEntity.name}</span>
                        </div>
                        {!link.bidirectional && (
                          <div className="flex items-center gap-2 text-[#64748B]">
                            <span className="font-medium">{targetEntity.name}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{link.reverse}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="font-medium">{sourceEntity.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {displayedLinks.length === 0 && (
                  <div className="col-span-2 flex items-center justify-center py-12 text-[#64748B]">
                    <div className="text-center">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No relationships found</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="px-6 py-4 border-t border-[#2D3742] flex justify-end gap-3 bg-[#181C24]">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}