import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Link2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Upload,
  Search,
  X,
  Image,
  FileSpreadsheet,
  Printer,
  Share2,
  FileJson,
  ChevronDown,
  Sparkles,
  Wand2,
  FileSearch,
  Plus,
  BarChart3,
  Users,
  Layout,
  Undo
} from 'lucide-react';
import { ENTITY_TYPES } from './EntityLibrary';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Palantir Gotham theme applied
export default function Toolbar({ 
  onZoomIn,
  onZoomOut,
  onResetView,
  onExportData,
  onExportCanvas,
  onPrintCanvas,
  onShareCanvas,
  onImport,
  onImportCSV,
  searchTerm,
  onSearchChange,
  onAISuggestions,
  onAICreateEntity,
  onAnalyzeDocument,
  onAddEntity,
  onShowAnalytics,
  onCreateGroup,
  onApplyLayout,
  hasSelection,
  onUndo,
  canUndo,
  onSearchEntities
}) {
  return (
    <div className="h-14 border-b px-4 flex items-center justify-between bg-[#11141A] border-[#2D3742]">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0B0E13] font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Entity
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {Object.entries(ENTITY_TYPES).map(([type, config]) => (
              <DropdownMenuItem key={type} onClick={() => onAddEntity(type)}>
                {config.icon ? (
                  <config.icon className="w-4 h-4 mr-2" style={{ color: config.color }} />
                ) : (
                  <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: config.color }} />
                )}
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={onAISuggestions}
            className="bg-[#181C24] border-[#00D4FF]/60 hover:bg-[#00D4FF] hover:text-[#0B0E13] text-[#00D4FF] font-medium"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Suggest
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onAICreateEntity}
            className="bg-[#181C24] border-[#00D4FF]/60 hover:bg-[#00D4FF] hover:text-[#0B0E13] text-[#00D4FF] font-medium"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            AI Create
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyzeDocument}
            className="bg-[#181C24] border-[#00D4FF]/60 hover:bg-[#00D4FF] hover:text-[#0B0E13] text-[#00D4FF] font-medium"
          >
            <FileSearch className="w-4 h-4 mr-2" />
            Analyze Doc
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onShowAnalytics}
            className="bg-[#181C24] border-[#10B981]/60 hover:bg-[#10B981] hover:text-[#0B0E13] text-[#10B981] font-medium"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>

        <div className="h-6 w-px mx-2 bg-slate-200" />

        <Button
          variant="outline"
          size="sm"
          onClick={onSearchEntities}
          className="bg-[#181C24] border-[#00D4FF]/60 hover:bg-[#00D4FF] hover:text-[#0B0E13] text-[#00D4FF] relative font-medium"
        >
          <Search className="w-4 h-4 mr-2" />
          Search All
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold text-[#00D4FF] bg-[#0B0E13] border border-[#00D4FF]/50 rounded">⌘K</kbd>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onCreateGroup}
          disabled={!hasSelection}
          className={hasSelection ? "bg-[#181C24] border-[#00D4FF]/60 hover:bg-[#00D4FF] hover:text-[#0B0E13] text-[#00D4FF] font-medium" : "bg-[#181C24] border-[#2D3742] text-[#64748B] opacity-50"}
        >
          <Users className="w-4 h-4 mr-2" />
          Create Group
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasSelection}
              className={hasSelection ? "bg-[#181C24] border-[#00D4FF]/60 hover:bg-[#00D4FF] hover:text-[#0B0E13] text-[#00D4FF] font-medium" : "bg-[#181C24] border-[#2D3742] text-[#64748B] opacity-50"}
            >
              <Layout className="w-4 h-4 mr-2" />
              Layout
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onApplyLayout('hierarchical')}>
              Hierarchical (Org Chart)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onApplyLayout('circular')}>
              Circular (Peer Network)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onApplyLayout('grid')}>
              Grid (Organized)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onApplyLayout('force')}>
              Force-Directed (Organic)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        </div>

        <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last action (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px mr-2 bg-slate-200" />
        
        <Button variant="outline" size="sm" onClick={onZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onResetView}>
          <Maximize className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px mx-2 bg-slate-200" />
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="w-4 h-4 mr-2" />
          Import JSON
        </Button>

        <Button variant="outline" size="sm" onClick={onImportCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Import CSV
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-[#181C24] border-[#2D3742] hover:bg-[#1E2530] hover:border-[#00D4FF] text-[#E2E8F0] font-medium">
              <Download className="w-4 h-4 mr-2" />
              Export
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportCanvas}>
              <Image className="w-4 h-4 mr-2" />
              Save as Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPrintCanvas}>
              <Printer className="w-4 h-4 mr-2" />
              Print Canvas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShareCanvas}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Canvas
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportData}>
              <FileJson className="w-4 h-4 mr-2" />
              Export Data (JSON)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}