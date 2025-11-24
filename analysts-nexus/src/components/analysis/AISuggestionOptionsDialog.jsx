import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles } from "lucide-react";

export default function AISuggestionOptionsDialog({ isOpen, onClose, onProceed }) {
  const [mode, setMode] = useState('general');
  const [pattern, setPattern] = useState('');

  const handleProceed = () => {
    onProceed({
      mode,
      pattern: mode === 'specific' ? pattern : null
    });
    onClose();
  };

  const handleClose = () => {
    setMode('general');
    setPattern('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            AI Relationship Suggestions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-600">
            How would you like the AI to analyze your entities?
          </p>

          <RadioGroup value={mode} onValueChange={setMode}>
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 hover:border-violet-300 transition-colors">
              <RadioGroupItem value="general" id="general" className="mt-0.5" />
              <Label htmlFor="general" className="flex-1 cursor-pointer">
                <div className="font-medium text-slate-900">General Suggestions</div>
                <p className="text-xs text-slate-500 mt-1">
                  Find all potential relationships between entities based on available data
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 hover:border-violet-300 transition-colors">
              <RadioGroupItem value="specific" id="specific" className="mt-0.5" />
              <Label htmlFor="specific" className="flex-1 cursor-pointer">
                <div className="font-medium text-slate-900">Look for Specific Pattern</div>
                <p className="text-xs text-slate-500 mt-1">
                  Describe a specific pattern or connection you want to find
                </p>
              </Label>
            </div>
          </RadioGroup>

          {mode === 'specific' && (
            <div className="space-y-2">
              <Label htmlFor="pattern" className="text-sm font-medium text-slate-700">
                Describe the pattern or connection
              </Label>
              <Textarea
                id="pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Example: Find all people who work for organizations located in Melbourne&#10;Example: Identify vehicles registered to people with criminal records&#10;Example: Show connections between all phone numbers and their owners"
                className="h-32 text-sm resize-none"
              />
              <p className="text-xs text-slate-500">
                Be specific about the types of entities and relationships you're looking for
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleProceed}
            disabled={mode === 'specific' && !pattern.trim()}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}