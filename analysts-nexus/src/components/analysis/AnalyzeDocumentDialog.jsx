import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { ENTITY_TYPES } from './EntityLibrary';

export default function AnalyzeDocumentDialog({ isOpen, onClose, onCreateEntities }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedEntities, setExtractedEntities] = useState([]);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [error, setError] = useState(null);
  const [isCsv, setIsCsv] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvPreview, setCsvPreview] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    nameColumn: '',
    typeColumn: '',
    descriptionColumn: '',
    attributeColumns: []
  });
  const [defaultEntityType, setDefaultEntityType] = useState('person');
  const [showMapping, setShowMapping] = useState(false);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setExtractedEntities([]);
      setSelectedEntities([]);
      setError(null);
      
      // Check if it's a CSV
      const isCSV = selectedFile.name.toLowerCase().endsWith('.csv');
      setIsCsv(isCSV);
      
      if (isCSV) {
        // Parse CSV to get headers and preview
        try {
          const text = await selectedFile.text();
          const lines = text.split('\n').filter(line => line.trim());
          
          // Helper to parse CSV line properly (handles quoted values)
          const parseCSVLine = (line) => {
            const cells = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                cells.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            cells.push(current.trim());
            return cells;
          };
          
          const headers = parseCSVLine(lines[0]);
          const previewRows = lines.slice(1, 4).map(line => {
            const cells = parseCSVLine(line);
            // Ensure each row has same number of cells as headers
            while (cells.length < headers.length) cells.push('');
            return cells.slice(0, headers.length);
          });
          
          setCsvHeaders(headers);
          setCsvPreview(previewRows);
          setShowMapping(true);
          
          // Auto-detect name column
          const nameCol = headers.find(h => 
            h.toLowerCase().includes('name') || 
            h.toLowerCase().includes('full') ||
            h.toLowerCase().includes('person')
          );
          if (nameCol) {
            setColumnMapping(prev => ({ ...prev, nameColumn: nameCol }));
          }
          
          // Auto-detect type column
          const typeCol = headers.find(h => h.toLowerCase().includes('type'));
          if (typeCol) {
            setColumnMapping(prev => ({ ...prev, typeColumn: typeCol }));
          }
          
          // Auto-detect description column
          const descCol = headers.find(h => 
            h.toLowerCase().includes('description') || 
            h.toLowerCase().includes('notes') ||
            h.toLowerCase().includes('details')
          );
          if (descCol) {
            setColumnMapping(prev => ({ ...prev, descriptionColumn: descCol }));
          }
          
        } catch (error) {
          console.error('Failed to parse CSV:', error);
          toast.error('Failed to parse CSV file');
        }
      } else {
        setShowMapping(false);
      }
    }
  };

  const handleAnalyzeCSV = async () => {
    if (!file || !columnMapping.nameColumn) {
      toast.error('Please map at least the Name column');
      return;
    }

    setUploading(true);
    setAnalyzing(true);
    setError(null);

    try {
      // Parse CSV directly instead of using ExtractDataFromUploadedFile
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Parse CSV with proper quote handling
      const parseCSVLine = (line) => {
        const cells = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cells.push(current.trim());
        return cells;
      };
      
      const headers = parseCSVLine(lines[0]);
      const dataRows = lines.slice(1);
      
      // Valid entity types
      const validTypes = ['person', 'organization', 'location', 'event', 'vehicle', 'phone', 'email', 'document'];
      
      // Transform to entities
      const entities = dataRows
        .map(line => {
          const cells = parseCSVLine(line);
          const row = {};
          headers.forEach((header, i) => {
            row[header] = cells[i] || '';
          });
          return row;
        })
        .filter(row => row[columnMapping.nameColumn] && row[columnMapping.nameColumn].trim())
        .map(row => {
          // Determine entity type - prioritize person names in Name column
          let entityType = defaultEntityType;

          // If Name column contains a person's name (contains space, suggesting first/last name), default to person
          const name = row[columnMapping.nameColumn] || '';
          const nameParts = name.trim().split(/\s+/);
          const looksLikePersonName = nameParts.length >= 2 && nameParts.length <= 4 && 
                                      nameParts.every(part => part.length > 0 && part[0] === part[0].toUpperCase());

          if (looksLikePersonName) {
            entityType = 'person';
          } else if (columnMapping.typeColumn && row[columnMapping.typeColumn]) {
            const csvType = row[columnMapping.typeColumn].toLowerCase().trim();
            // Check if it's a valid type or try to map common variations
            if (validTypes.includes(csvType)) {
              entityType = csvType;
            } else if (csvType.includes('org') || csvType.includes('company') || csvType.includes('business')) {
              entityType = 'organization';
            } else if (csvType.includes('place') || csvType.includes('address')) {
              entityType = 'location';
            } else if (csvType.includes('car') || csvType.includes('vehicle')) {
              entityType = 'vehicle';
            } else if (csvType.includes('person') || csvType.includes('people') || csvType.includes('individual')) {
              entityType = 'person';
            }
          }
          
          const entity = {
            name: row[columnMapping.nameColumn] || 'Unnamed',
            type: entityType,
            description: columnMapping.descriptionColumn ? (row[columnMapping.descriptionColumn] || '') : '',
            attributes: {}
          };
          
          // Add all other columns as attributes
          headers.forEach(header => {
            if (header !== columnMapping.nameColumn && 
                header !== columnMapping.typeColumn && 
                header !== columnMapping.descriptionColumn &&
                row[header] && row[header].trim()) {
              entity.attributes[header] = row[header];
            }
          });
          
          // Process entity-specific attributes for better display
          if (entity.type === 'person' && entity.name) {
            const nameParts = entity.name.split(' ');
            if (!entity.attributes.first_name) {
              entity.attributes.first_name = nameParts[0] || '';
            }
            if (!entity.attributes.surname) {
              entity.attributes.surname = nameParts.slice(1).join(' ') || '';
            }
          } else if (entity.type === 'phone' && !entity.attributes.Number) {
            // Auto-detect phone number from attributes
            const phoneKey = headers.find(h => h.toLowerCase().includes('phone') || h.toLowerCase().includes('number'));
            if (phoneKey && row[phoneKey]) {
              entity.attributes.Number = row[phoneKey];
            }
          } else if (entity.type === 'email' && !entity.attributes['Email Address']) {
            // Auto-detect email from attributes
            const emailKey = headers.find(h => h.toLowerCase().includes('email') || h.toLowerCase().includes('mail'));
            if (emailKey && row[emailKey]) {
              entity.attributes['Email Address'] = row[emailKey];
            }
          } else if (entity.type === 'vehicle' && !entity.attributes.Registration) {
            // Auto-detect registration from attributes
            const regoKey = headers.find(h => h.toLowerCase().includes('rego') || h.toLowerCase().includes('registration') || h.toLowerCase().includes('plate'));
            if (regoKey && row[regoKey]) {
              entity.attributes.Registration = row[regoKey];
            }
          } else if (entity.type === 'organization' && !entity.attributes.Address) {
            // Auto-detect address from attributes
            const addressKey = headers.find(h => h.toLowerCase().includes('address'));
            if (addressKey && row[addressKey]) {
              entity.attributes.Address = row[addressKey];
            }
          }
          
          return entity;
        });
      
      setExtractedEntities(entities);
      setSelectedEntities(entities.map((_, index) => index));
      setShowMapping(false);
      toast.success(`Extracted ${entities.length} entities from CSV`);
    } catch (error) {
      console.error(error);
      setError(error.message || 'Failed to analyze CSV');
      toast.error('Failed to analyze CSV');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    
    // Route to CSV handler if CSV
    if (isCsv) {
      return handleAnalyzeCSV();
    }

    setUploading(true);
    setAnalyzing(true);
    setError(null);

    try {
      // Upload file first
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      // Use AI to analyze document content
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and extract all entities with maximum detail.

      CRITICAL CLASSIFICATION RULES:
      - If a name refers to an INDIVIDUAL person (e.g., "John Smith", "Jane Doe, CEO"), classify as 'person' type, NOT 'organization'
      - Only classify as 'organization' if it's clearly a company, business, or institution name (e.g., "Acme Corp", "Department of Health")
      - A person's job title or role does NOT make them an organization
      - Examples: "Jess Wilson" = person, "George Crozier" = person, "Business Council of Australia" = organization

      For PERSON entities extract: Legal Name, Date of Birth, Aliases/AKAs, Place of Birth, Nationalities, Passports, National IDs, Physical Descriptions (height, weight, eye color, hair color, distinguishing marks), Biometrics, Current Address, Previous Addresses, Phone Numbers, Email Addresses, Social Media profiles, IP Addresses, Vehicles, Frequent Locations, Family Members, Associates, Education, Employment, Professional Licenses, Military Service, Security Clearances, Bank Accounts, Credit Cards, Crypto Wallets, Income Sources, Net Worth, Major Assets, Debts, Credit Score, Dating App Profiles, Forums & Communities, Dark Web Presence, Messaging Apps, Cloud Storage, Data Breaches, Criminal Records, Civil Lawsuits, Restraining Orders, Warrants, Gang Affiliations, Watchlists, Personality Traits, Political Leanings, Religious Affiliation, Known Vices, Medical Conditions, Phobias, Daily Routines, Financial Pressures, Compromising Material, Threat Level, Recruitment Potential, Travel History, Border Crossings.

      For ORGANIZATION entities extract: Business Name, Address, ACN, ABN, Registration Numbers, Contact details, Key personnel, Industry, Revenue.

      For LOCATION entities extract: Address, State, Coordinates, Description, Type.

      For EVENT entities extract: Date, Location, Description, Participants, Outcomes.

      For VEHICLE entities extract: Registration, VIN Number, State Registered, Make, Model, Year, Color, Owner.

      For PHONE entities extract: Number, Carrier, Type, Owner.

      For EMAIL entities extract: Email Address, Owner, Type, Associated accounts.

      For DOCUMENT entities extract: Date, Title, Type, Author, Content summary.

      Extract ALL information present in the document for each entity, even partial or incomplete data. Create detailed attributes objects with all available fields.`,
        file_urls: [uploadResult.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { 
                    type: "string",
                    enum: ["person", "organization", "location", "event", "vehicle", "phone", "email", "document"]
                  },
                  description: { type: "string" },
                  attributes: { 
                    type: "object",
                    additionalProperties: true
                  }
                },
                required: ["name", "type"]
              }
            }
          },
          required: ["entities"]
        }
      });

      const entities = analysisResult.entities || [];
      
      // Process entities for person type
      const processedEntities = entities.map(entity => {
        if (entity.type === 'person' && entity.name) {
          const nameParts = entity.name.split(' ');
          return {
            ...entity,
            attributes: {
              ...entity.attributes,
              first_name: nameParts[0] || '',
              surname: nameParts.slice(1).join(' ') || ''
            }
          };
        }
        return entity;
      });
      
      setExtractedEntities(processedEntities);
      setSelectedEntities(processedEntities.map((_, index) => index));
      toast.success(`Found ${processedEntities.length} entities in document`);
    } catch (error) {
      console.error(error);
      setError('Failed to analyze document');
      toast.error('Failed to analyze document');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const toggleEntity = (index) => {
    setSelectedEntities(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleCreate = () => {
    const entitiesToCreate = selectedEntities.map(index => extractedEntities[index]);
    onCreateEntities(entitiesToCreate);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setExtractedEntities([]);
    setSelectedEntities([]);
    setError(null);
    setIsCsv(false);
    setCsvHeaders([]);
    setCsvPreview([]);
    setColumnMapping({
      nameColumn: '',
      typeColumn: '',
      descriptionColumn: '',
      attributeColumns: []
    });
    setShowMapping(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Analyze Document for Entities
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div>
            <input
              type="file"
              id="doc-analyze-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.csv"
              onChange={handleFileSelect}
              disabled={analyzing}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('doc-analyze-upload').click()}
              disabled={analyzing}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {file ? file.name : 'Select Document (PDF, Image, or CSV)'}
            </Button>
          </div>

          {/* CSV Column Mapping */}
          {showMapping && isCsv && csvHeaders.length > 0 && (
            <Card className="p-4 space-y-4 bg-slate-50">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Map CSV Columns to Entity Fields</h3>
                <p className="text-xs text-slate-600 mb-4">Select which columns contain entity information</p>
              </div>

              {/* CSV Preview */}
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs table-fixed">
                    <thead className="bg-slate-100 border-b">
                      <tr>
                        {csvHeaders.map((header, i) => (
                          <th key={i} className="px-3 py-2 text-left font-medium text-slate-700 truncate" style={{ minWidth: '120px' }}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className="border-b">
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2 text-slate-600 truncate" style={{ minWidth: '120px' }}>
                              {cell || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Column Mapping Selects */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                    Name Column *
                  </label>
                  <Select
                    value={columnMapping.nameColumn}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, nameColumn: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select column for entity name" />
                    </SelectTrigger>
                    <SelectContent>
                      {csvHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                    Type Column (optional)
                  </label>
                  <Select
                    value={columnMapping.typeColumn}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, typeColumn: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select column for entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None - Use default type</SelectItem>
                      {csvHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!columnMapping.typeColumn && (
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                      Default Entity Type
                    </label>
                    <Select
                      value={defaultEntityType}
                      onValueChange={setDefaultEntityType}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ENTITY_TYPES).map(([type, config]) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              {config.icon && <config.icon className="w-4 h-4" style={{ color: config.color }} />}
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1.5 block">
                    Description Column (optional)
                  </label>
                  <Select
                    value={columnMapping.descriptionColumn}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, descriptionColumn: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select column for description" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {csvHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-slate-500 italic">
                  All other columns will be added as entity attributes
                </p>
              </div>
            </Card>
          )}

          {file && !extractedEntities.length && !showMapping && (
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing document...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Analyze Document
                </>
              )}
            </Button>
          )}

          {showMapping && isCsv && (
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !columnMapping.nameColumn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting entities from CSV...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Extract Entities from CSV
                </>
              )}
            </Button>
          )}

          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Analysis Failed</p>
                  <p className="text-xs text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Extracted Entities */}
          {extractedEntities.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Extracted Entities ({selectedEntities.length} selected)
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (selectedEntities.length === extractedEntities.length) {
                      setSelectedEntities([]);
                    } else {
                      setSelectedEntities(extractedEntities.map((_, i) => i));
                    }
                  }}
                >
                  {selectedEntities.length === extractedEntities.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="p-3 space-y-2">
                  {extractedEntities.map((entity, index) => {
                    const config = ENTITY_TYPES[entity.type] || { color: '#64748b', label: 'Unknown' };
                    const Icon = config.icon;
                    const isSelected = selectedEntities.includes(index);

                    return (
                      <Card
                        key={index}
                        className={`p-3 cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                        onClick={() => toggleEntity(index)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleEntity(index)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          
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
                            <div className="font-medium text-sm text-slate-900">
                              {entity.name}
                            </div>
                            <Badge
                              variant="secondary"
                              className="mt-1 text-xs"
                              style={{ 
                                backgroundColor: `${config.color}10`, 
                                color: config.color 
                              }}
                            >
                              {config.label}
                            </Badge>
                            {entity.description && (
                              <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                                {entity.description}
                              </p>
                            )}
                            {entity.attributes && Object.keys(entity.attributes).length > 0 && (
                              <div className="mt-2 text-xs text-slate-500">
                                {Object.entries(entity.attributes).slice(0, 2).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {extractedEntities.length > 0 && (
            <Button 
              onClick={handleCreate}
              disabled={selectedEntities.length === 0}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Add {selectedEntities.length} Entit{selectedEntities.length === 1 ? 'y' : 'ies'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}