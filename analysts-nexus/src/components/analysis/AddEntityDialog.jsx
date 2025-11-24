import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, X } from 'lucide-react';
import { cn } from "@/lib/utils";

const ENTITY_CATEGORIES = {
  'People': [
    { type: 'person', label: 'Person', icon: '👤', fields: ['name', 'dob', 'gender', 'phone', 'email', 'address', 'alias', 'notes'] },
    { type: 'person_male', label: 'Male', icon: '👨', fields: ['name', 'dob', 'phone', 'email', 'address', 'alias', 'notes'] },
    { type: 'person_female', label: 'Female', icon: '👩', fields: ['name', 'dob', 'phone', 'email', 'address', 'alias', 'notes'] },
    { type: 'offender', label: 'Offender', icon: '⚠️', fields: ['name', 'dob', 'gender', 'criminal_record', 'last_known_address', 'phone', 'notes'] },
    { type: 'law_enforcement', label: 'Law Enforcement Officer', icon: '👮', fields: ['name', 'badge_number', 'rank', 'department', 'phone', 'email', 'notes'] },
    { type: 'person_alias', label: 'Person Alias', icon: '🎭', fields: ['alias_name', 'real_name', 'used_since', 'context', 'notes'] },
    { type: 'child', label: 'Child', icon: '🧒', fields: ['name', 'dob', 'guardian', 'school', 'address', 'notes'] }
  ],
  'Organizations': [
    { type: 'organization', label: 'Organization', icon: '🏢', fields: ['name', 'type', 'phone', 'email', 'address', 'website', 'notes'] },
    { type: 'company', label: 'Company', icon: '🏛️', fields: ['business_name', 'abn', 'acn', 'registered_address', 'phone', 'website', 'director', 'notes'] },
    { type: 'bank', label: 'Bank', icon: '🏦', fields: ['bank_name', 'bsb', 'branch_address', 'phone', 'swift_code', 'notes'] },
    { type: 'government_agency', label: 'Government Agency', icon: '🏛️', fields: ['agency_name', 'department', 'contact_person', 'phone', 'email', 'address', 'notes'] },
    { type: 'law_enforcement_agency', label: 'Law Enforcement Agency', icon: '👮‍♂️', fields: ['agency_name', 'jurisdiction', 'headquarters', 'phone', 'emergency_contact', 'notes'] },
    { type: 'criminal_organization', label: 'Criminal Organization', icon: '☠️', fields: ['name', 'type', 'known_activities', 'leader', 'territory', 'notes'] },
    { type: 'court', label: 'Court', icon: '⚖️', fields: ['court_name', 'jurisdiction', 'address', 'phone', 'case_types', 'notes'] }
  ],
  'Locations': [
    { type: 'location', label: 'Location', icon: '📍', fields: ['name', 'type', 'coordinates', 'address', 'notes'] },
    { type: 'address', label: 'Address', icon: '🏠', fields: ['street', 'suburb', 'state', 'postcode', 'country', 'notes'] },
    { type: 'mailing_address', label: 'Mailing Address', icon: '📮', fields: ['recipient', 'po_box', 'suburb', 'state', 'postcode', 'country', 'notes'] },
    { type: 'atm', label: 'ATM', icon: '🏧', fields: ['location', 'bank', 'atm_id', 'address', 'notes'] },
    { type: 'geographic_location', label: 'Geographic Location', icon: '🗺️', fields: ['place_name', 'latitude', 'longitude', 'region', 'country', 'notes'] }
  ],
  'Financial': [
    { type: 'account', label: 'Account', icon: '💳', fields: ['account_name', 'account_number', 'institution', 'holder', 'notes'] },
    { type: 'bank_account', label: 'Bank Account', icon: '🏦', fields: ['account_name', 'bsb', 'account_number', 'bank', 'holder', 'notes'] },
    { type: 'credit_card', label: 'Credit Card', icon: '💳', fields: ['card_number', 'holder_name', 'expiry', 'issuer', 'credit_limit', 'notes'] },
    { type: 'debit_card', label: 'Debit Card', icon: '💳', fields: ['card_number', 'holder_name', 'expiry', 'bank', 'linked_account', 'notes'] }
  ],
  'Vehicles': [
    { type: 'vehicle', label: 'Vehicle', icon: '🚗', fields: ['registration', 'state', 'make_model', 'vin', 'color', 'owner', 'notes'] },
    { type: 'car', label: 'Car', icon: '🚙', fields: ['registration', 'state', 'make_model', 'year', 'vin', 'color', 'owner', 'notes'] },
    { type: 'truck', label: 'Truck', icon: '🚚', fields: ['registration', 'state', 'make_model', 'year', 'vin', 'capacity', 'owner', 'notes'] },
    { type: 'motorcycle', label: 'Motorcycle', icon: '🏍️', fields: ['registration', 'state', 'make_model', 'year', 'vin', 'cc', 'owner', 'notes'] },
    { type: 'bus', label: 'Bus', icon: '🚌', fields: ['registration', 'state', 'make_model', 'fleet_number', 'operator', 'route', 'notes'] },
    { type: 'police_car', label: 'Police Car', icon: '🚓', fields: ['registration', 'state', 'unit_number', 'department', 'assigned_officer', 'notes'] }
  ],
  'Property': [
    { type: 'house', label: 'House', icon: '🏡', fields: ['address', 'owner', 'property_type', 'value', 'purchase_date', 'notes'] },
    { type: 'crypto_wallet', label: 'Crypto Wallet', icon: '₿', fields: ['address', 'blockchain', 'owner', 'balance', 'notes'] }
  ],
  'Communication': [
    { type: 'telephone', label: 'Telephone', icon: '☎️', fields: ['number', 'type', 'owner', 'notes'] },
    { type: 'phone', label: 'Cell Phone', icon: '📱', fields: ['number', 'carrier', 'owner', 'notes'] },
    { type: 'fax', label: 'Fax', icon: '📠', fields: ['number', 'owner', 'location', 'notes'] },
    { type: 'pager', label: 'Pager', icon: '📟', fields: ['number', 'owner', 'service_provider', 'notes'] },
    { type: 'email', label: 'Email Address', icon: '📧', fields: ['email', 'provider', 'owner', 'notes'] },
    { type: 'website', label: 'Website', icon: '🌐', fields: ['url', 'owner', 'hosting_provider', 'registered_date', 'notes'] },
    { type: 'webpage', label: 'Web Page', icon: '📄', fields: ['url', 'title', 'website', 'content_summary', 'notes'] }
  ],
  'Events & Calls': [
    { type: 'meeting', label: 'Meeting', icon: '🤝', fields: ['title', 'date', 'time', 'location', 'attendees', 'notes'] },
    { type: 'event', label: 'Crime Event', icon: '🚨', fields: ['event_name', 'date', 'time', 'location', 'type', 'involved_parties', 'notes'] },
    { type: 'telephone_call', label: 'Telephone Call', icon: '📞', fields: ['caller', 'recipient', 'date', 'time', 'duration', 'notes'] },
    { type: 'transaction', label: 'Transaction', icon: '💰', fields: ['amount', 'date', 'from_account', 'to_account', 'type', 'reference', 'notes'] },
    { type: 'appointment', label: 'Appointment', icon: '📅', fields: ['title', 'date', 'time', 'location', 'participants', 'notes'] }
  ],
  'Other': [
    { type: 'device', label: 'Device', icon: '📱', fields: ['device_type', 'model', 'serial_number', 'imei', 'owner', 'notes'] },
    { type: 'document', label: 'Message', icon: '💬', fields: ['subject', 'sender', 'recipient', 'date', 'content', 'notes'] },
    { type: 'owner', label: 'Owner', icon: '👤', fields: ['owner_name', 'owned_items', 'contact', 'notes'] }
  ]
};

const FIELD_LABELS = {
  name: 'Full Name',
  dob: 'Date of Birth',
  gender: 'Gender',
  phone: 'Phone Number',
  email: 'Email Address',
  address: 'Address',
  alias: 'Known Aliases',
  notes: 'Notes',
  business_name: 'Business Name',
  abn: 'ABN',
  acn: 'ACN',
  registered_address: 'Registered Address',
  website: 'Website',
  director: 'Director / CEO',
  number: 'Number',
  carrier: 'Carrier',
  owner: 'Owner Name',
  account_name: 'Account Name',
  bsb: 'BSB',
  account_number: 'Account Number',
  bank: 'Bank',
  holder: 'Account Holder',
  blockchain: 'Blockchain',
  balance: 'Balance (Optional)',
  registration: 'Registration / Plate',
  state: 'State Registered',
  make_model: 'Make / Model',
  vin: 'VIN',
  color: 'Color',
  street: 'Street Address',
  suburb: 'Suburb',
  postcode: 'Postcode',
  country: 'Country',
  criminal_record: 'Criminal Record',
  last_known_address: 'Last Known Address',
  badge_number: 'Badge Number',
  rank: 'Rank',
  department: 'Department',
  alias_name: 'Alias Name',
  real_name: 'Real Name',
  used_since: 'Used Since',
  context: 'Context / Usage',
  guardian: 'Guardian',
  school: 'School',
  type: 'Type',
  coordinates: 'Coordinates',
  po_box: 'PO Box',
  recipient: 'Recipient',
  atm_id: 'ATM ID',
  latitude: 'Latitude',
  longitude: 'Longitude',
  place_name: 'Place Name',
  region: 'Region',
  account_holder: 'Account Holder',
  institution: 'Institution',
  card_number: 'Card Number (Last 4)',
  holder_name: 'Cardholder Name',
  expiry: 'Expiry (MM/YY)',
  issuer: 'Issuer',
  credit_limit: 'Credit Limit',
  linked_account: 'Linked Account',
  year: 'Year',
  capacity: 'Capacity',
  cc: 'Engine Size (cc)',
  fleet_number: 'Fleet Number',
  operator: 'Operator',
  route: 'Route',
  unit_number: 'Unit Number',
  assigned_officer: 'Assigned Officer',
  property_type: 'Property Type',
  value: 'Estimated Value',
  purchase_date: 'Purchase Date',
  provider: 'Provider',
  url: 'URL',
  hosting_provider: 'Hosting Provider',
  registered_date: 'Registered Date',
  title: 'Title',
  content_summary: 'Content Summary',
  date: 'Date',
  time: 'Time',
  location: 'Location',
  attendees: 'Attendees',
  event_name: 'Event Name',
  involved_parties: 'Involved Parties',
  caller: 'Caller',
  duration: 'Duration',
  amount: 'Amount',
  from_account: 'From Account',
  to_account: 'To Account',
  reference: 'Reference',
  participants: 'Participants',
  device_type: 'Device Type',
  model: 'Model',
  serial_number: 'Serial Number',
  imei: 'IMEI',
  subject: 'Subject',
  sender: 'Sender',
  content: 'Content',
  owner_name: 'Owner Name',
  owned_items: 'Owned Items',
  contact: 'Contact',
  agency_name: 'Agency Name',
  contact_person: 'Contact Person',
  jurisdiction: 'Jurisdiction',
  headquarters: 'Headquarters',
  emergency_contact: 'Emergency Contact',
  known_activities: 'Known Activities',
  leader: 'Leader',
  territory: 'Territory',
  court_name: 'Court Name',
  case_types: 'Case Types Handled',
  bank_name: 'Bank Name',
  branch_address: 'Branch Address',
  swift_code: 'SWIFT Code'
};

export default function AddEntityDialog({ isOpen, onClose, onCreate, position }) {
  const [selectedCategory, setSelectedCategory] = useState('People');
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [quickSearch, setQuickSearch] = useState('');
  const firstInputRef = useRef(null);

  // Remember last category in localStorage
  useEffect(() => {
    if (isOpen) {
      const lastCategory = localStorage.getItem('last_entity_category');
      if (lastCategory && ENTITY_CATEGORIES[lastCategory]) {
        setSelectedCategory(lastCategory);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('last_entity_category', selectedCategory);
    }
  }, [selectedCategory]);

  // Auto-focus first input
  useEffect(() => {
    if (selectedType && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [selectedType]);

  // Quick search filtering
  const filteredCategories = React.useMemo(() => {
    if (!quickSearch.trim()) return ENTITY_CATEGORIES;
    
    const term = quickSearch.toLowerCase();
    const filtered = {};
    
    Object.entries(ENTITY_CATEGORIES).forEach(([category, types]) => {
      const matchingTypes = types.filter(t => 
        t.label.toLowerCase().includes(term)
      );
      if (matchingTypes.length > 0) {
        filtered[category] = matchingTypes;
      }
    });
    
    return filtered;
  }, [quickSearch]);

  // Auto-select if only one result
  useEffect(() => {
    if (quickSearch.trim()) {
      const allTypes = Object.values(filteredCategories).flat();
      if (allTypes.length === 1) {
        const category = Object.keys(filteredCategories)[0];
        setSelectedCategory(category);
        setSelectedType(allTypes[0]);
        setQuickSearch('');
      }
    }
  }, [quickSearch, filteredCategories]);

  const handleCreate = () => {
    if (!selectedType) return;

    // Build entity name from form data
    let entityName = 'Unnamed';
    if (formData.name) entityName = formData.name;
    else if (formData.business_name) entityName = formData.business_name;
    else if (formData.number) entityName = formData.number;
    else if (formData.email) entityName = formData.email;
    else if (formData.address) entityName = formData.address;
    else if (formData.registration) entityName = formData.registration;
    else if (formData.street) entityName = formData.street;
    else if (formData.account_name) entityName = formData.account_name;
    else if (formData.url) entityName = formData.url;
    else if (formData.title) entityName = formData.title;
    else if (formData.alias_name) entityName = formData.alias_name;
    else if (formData.agency_name) entityName = formData.agency_name;
    else if (formData.bank_name) entityName = formData.bank_name;
    else if (formData.court_name) entityName = formData.court_name;
    else if (formData.event_name) entityName = formData.event_name;

    const entityData = {
      name: entityName,
      type: selectedType.type === 'phone' ? 'phone' : 
            selectedType.type === 'email' ? 'email' :
            selectedType.type.startsWith('person') ? 'person' :
            selectedType.type.includes('organization') || selectedType.type === 'company' || 
            selectedType.type === 'bank' || selectedType.type === 'court' ? 'organization' :
            selectedType.type.includes('address') || selectedType.type === 'location' || 
            selectedType.type === 'atm' || selectedType.type === 'geographic_location' ? 'location' :
            selectedType.type.includes('vehicle') || selectedType.type === 'car' || 
            selectedType.type === 'truck' || selectedType.type === 'motorcycle' || 
            selectedType.type === 'bus' || selectedType.type === 'police_car' ? 'vehicle' :
            selectedType.type.includes('event') || selectedType.type === 'meeting' || 
            selectedType.type === 'appointment' || selectedType.type === 'telephone_call' ? 'event' :
            selectedType.type === 'document' ? 'document' :
            'person',
      description: formData.notes || '',
      position: position || { x: 400, y: 300 },
      attributes: {
        entity_subtype: selectedType.type,
        entity_label: selectedType.label,
        ...formData
      }
    };

    onCreate(entityData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedType(null);
    setFormData({});
    setQuickSearch('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && selectedType) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[80vh] p-0 gap-0 bg-[#11141A] border-[#2D3742]">
        <DialogHeader className="px-6 py-4 border-b border-[#2D3742] bg-[#181C24]">
          <DialogTitle className="text-xl font-semibold text-[#E2E8F0]">Add Entity</DialogTitle>
        </DialogHeader>

        {/* Quick Search */}
        <div className="px-6 py-3 border-b border-[#2D3742] bg-[#181C24]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Quick search entity types... (e.g., 'person', 'phone')"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Categories */}
          <div className="w-64 border-r border-[#2D3742] bg-[#181C24] flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {Object.keys(filteredCategories).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedType(null);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      selectedCategory === category
                        ? "bg-[#1E293B] text-[#00D4FF] border-l-2 border-[#00D4FF]"
                        : "text-[#E2E8F0] hover:bg-[#1E2530]"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Middle - Entity Types */}
          <div className="w-72 border-r border-[#2D3742] flex flex-col bg-[#11141A]">
            <div className="px-4 py-3 border-b border-[#2D3742] bg-[#181C24]">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">{selectedCategory}</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {filteredCategories[selectedCategory]?.map((entityType) => (
                  <button
                    key={entityType.type}
                    onClick={() => {
                      setSelectedType(entityType);
                      setFormData({});
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3",
                      selectedType?.type === entityType.type
                        ? "bg-[#1E293B] text-[#00D4FF] border-l-2 border-[#00D4FF]"
                        : "text-[#E2E8F0] hover:bg-[#1E2530]"
                    )}
                  >
                    <span className="text-lg">{entityType.icon}</span>
                    <span className="font-medium">{entityType.label}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right - Form */}
          <div className="flex-1 flex flex-col">
            {selectedType ? (
              <>
                <div className="px-6 py-4 border-b border-[#2D3742] bg-[#181C24]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedType.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-[#E2E8F0]">{selectedType.label}</h3>
                      <p className="text-xs text-[#94A3B8]">Fill in the details below</p>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-4" onKeyPress={handleKeyPress}>
                    {selectedType.fields.map((field, index) => (
                      <div key={field}>
                        <Label className="text-sm font-medium text-[#E2E8F0]">
                          {FIELD_LABELS[field] || field}
                          {index === 0 && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {field === 'notes' || field === 'content' || field === 'content_summary' ? (
                          <Textarea
                            value={formData[field] || ''}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            className="mt-1.5 h-24 resize-none"
                            placeholder={`Enter ${FIELD_LABELS[field]?.toLowerCase() || field}...`}
                          />
                        ) : field === 'gender' ? (
                          <Select
                            value={formData[field] || ''}
                            onValueChange={(value) => setFormData({ ...formData, [field]: value })}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                              <SelectItem value="Unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : field === 'state' ? (
                          <Select
                            value={formData[field] || ''}
                            onValueChange={(value) => setFormData({ ...formData, [field]: value })}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VIC">VIC</SelectItem>
                              <SelectItem value="NSW">NSW</SelectItem>
                              <SelectItem value="QLD">QLD</SelectItem>
                              <SelectItem value="SA">SA</SelectItem>
                              <SelectItem value="WA">WA</SelectItem>
                              <SelectItem value="TAS">TAS</SelectItem>
                              <SelectItem value="NT">NT</SelectItem>
                              <SelectItem value="ACT">ACT</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : field === 'blockchain' ? (
                          <Select
                            value={formData[field] || ''}
                            onValueChange={(value) => setFormData({ ...formData, [field]: value })}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select blockchain" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Bitcoin">Bitcoin (BTC)</SelectItem>
                              <SelectItem value="Ethereum">Ethereum (ETH)</SelectItem>
                              <SelectItem value="Tether">Tether (USDT)</SelectItem>
                              <SelectItem value="Solana">Solana (SOL)</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            ref={index === 0 ? firstInputRef : null}
                            type={field.includes('date') ? 'date' : 
                                  field === 'dob' ? 'date' :
                                  field === 'email' ? 'email' :
                                  field === 'phone' || field === 'number' ? 'tel' :
                                  field === 'url' || field === 'website' ? 'url' : 'text'}
                            value={formData[field] || ''}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            className="mt-1.5"
                            placeholder={`Enter ${FIELD_LABELS[field]?.toLowerCase() || field}...`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="px-6 py-4 border-t border-[#2D3742] flex justify-end gap-3 bg-[#181C24]">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    className="bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-[#0B0E13] font-medium"
                  >
                    Create Entity
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#64748B]">
                <div className="text-center">
                  <div className="text-5xl mb-4">👈</div>
                  <p className="text-sm">Select an entity type to begin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}