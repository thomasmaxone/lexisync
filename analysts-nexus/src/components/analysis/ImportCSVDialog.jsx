import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// Simple CSV parser
const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], data: [] };
  
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };
  
  const headers = parseLine(lines[0]);
  const data = lines.slice(1).map(line => {
    const values = parseLine(line);
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
  
  return { headers, data };
};

export default function ImportCSVDialog({ isOpen, onClose, onImport }) {
  const [csvData, setCsvData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    name: '',
    description: '',
    type: '',
    color: ''
  });
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog closes
      setCsvData(null);
      setHeaders([]);
      setRows([]);
      setColumnMapping({ name: '', description: '', type: '', color: '' });
    }
  }, [isOpen]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const { headers: csvHeaders, data: csvRows } = parseCSV(text);

        if (!csvHeaders || csvHeaders.length === 0) {
          toast.error('Invalid CSV file. Please check format.');
          setParsing(false);
          return;
        }

        if (!csvRows || csvRows.length === 0) {
          toast.error('No data found in CSV');
          setParsing(false);
          return;
        }

        if (csvRows.length > 1000) {
          toast.warning('Large file detected. Only first 500 rows will be imported.');
          csvRows.splice(500);
        }

        setCsvData(csvRows);
        setHeaders(csvHeaders);
        setRows(csvRows.slice(0, 5)); // Preview first 5 rows

        // Auto-map common columns
        const nameCol = csvHeaders.find(h => 
          h.toLowerCase().includes('name') || 
          h.toLowerCase().includes('title') ||
          h.toLowerCase().includes('entity')
        );
        const descCol = csvHeaders.find(h => 
          h.toLowerCase().includes('description') || 
          h.toLowerCase().includes('desc') ||
          h.toLowerCase().includes('notes')
        );
        const typeCol = csvHeaders.find(h => h.toLowerCase().includes('type'));
        const colorCol = csvHeaders.find(h => h.toLowerCase().includes('color'));

        setColumnMapping({
          name: nameCol || csvHeaders[0] || '',
          description: descCol || '',
          type: typeCol || '',
          color: colorCol || ''
        });

        setParsing(false);
      } catch (error) {
        console.error('CSV parse error:', error);
        toast.error('Failed to parse CSV file');
        setParsing(false);
      }
    };
    
    reader.onerror = () => {
      toast.error('Failed to read file');
      setParsing(false);
    };
    
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!columnMapping.name) {
      toast.error('Please map the Name column');
      return;
    }

    if (!csvData || csvData.length === 0) {
      toast.error('No data to import');
      return;
    }

    // Convert CSV rows to entities
    const entities = csvData
      .filter(row => row[columnMapping.name] && row[columnMapping.name].trim())
      .map((row, index) => {
        const entity = {
          name: row[columnMapping.name].trim(),
          type: 'person', // Default type
          description: columnMapping.description ? (row[columnMapping.description] || '') : '',
          color: columnMapping.color ? (row[columnMapping.color] || '') : '',
          attributes: {}
        };

        // If type column is mapped, use it
        if (columnMapping.type && row[columnMapping.type]) {
          const typeValue = row[columnMapping.type].toLowerCase().trim();
          const validTypes = ['person', 'organization', 'location', 'event', 'vehicle', 'phone', 'email', 'document'];
          if (validTypes.includes(typeValue)) {
            entity.type = typeValue;
          }
        }

        // Add all other columns as custom attributes
        Object.keys(row).forEach(key => {
          if (key !== columnMapping.name && 
              key !== columnMapping.description && 
              key !== columnMapping.type &&
              key !== columnMapping.color &&
              row[key] && row[key].trim()) {
            entity.attributes[key] = row[key].trim();
          }
        });

        return entity;
      });

    if (entities.length === 0) {
      toast.error('No valid entities found (missing names)');
      return;
    }

    onImport(entities);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Import Entities from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          {!csvData && (
            <div>
              <input
                type="file"
                id="csv-import-upload"
                className="hidden"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={parsing}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('csv-import-upload').click()}
                disabled={parsing}
                className="w-full h-32 border-dashed"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Parsing CSV...
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mr-2" />
                    Click to Select CSV File
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Maximum 500 rows. First column should contain entity names.
              </p>
            </div>
          )}

          {/* Column Mapping */}
          {csvData && headers.length > 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-900">
                    <strong>Found {csvData.length} rows.</strong> Map CSV columns to entity fields below.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name-col">Name Column *</Label>
                  <Select
                    value={columnMapping.name}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, name: value })}
                  >
                    <SelectTrigger id="name-col" className="mt-1.5">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="desc-col">Description Column</Label>
                  <Select
                    value={columnMapping.description}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, description: value })}
                  >
                    <SelectTrigger id="desc-col" className="mt-1.5">
                      <SelectValue placeholder="None (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type-col">Type Column</Label>
                  <Select
                    value={columnMapping.type}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, type: value })}
                  >
                    <SelectTrigger id="type-col" className="mt-1.5">
                      <SelectValue placeholder="None (default: person)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color-col">Color Column</Label>
                  <Select
                    value={columnMapping.color}
                    onValueChange={(value) => setColumnMapping({ ...columnMapping, color: value })}
                  >
                    <SelectTrigger id="color-col" className="mt-1.5">
                      <SelectValue placeholder="None (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview Table */}
              <div>
                <Label className="mb-2 block">Preview (first 5 rows)</Label>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <ScrollArea className="h-64">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 border-b sticky top-0">
                        <tr>
                          {headers.map((header) => (
                            <th key={header} className="px-3 py-2 text-left font-medium text-slate-700 whitespace-nowrap">
                              {header}
                              {header === columnMapping.name && <span className="ml-1 text-blue-600">★</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i} className="border-b">
                            {headers.map((header) => (
                              <td key={header} className="px-3 py-2 text-slate-600">
                                {row[header] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  * All other columns will be added as custom attributes
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {csvData && (
            <Button 
              onClick={handleConfirmImport}
              disabled={!columnMapping.name}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Import {csvData.length} Entities
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}