import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIEntityDialog({ isOpen, onClose, onCreate }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract entity information from this description and create a structured entity record.

Description: ${prompt}

Instructions:
- Determine the most appropriate entity type (person, organization, location, event, vehicle, phone, email, document, or symbol_*)
- Extract all relevant attributes based on the entity type
- For person: extract name, physical description, addresses, contact info, etc.
- For organization: extract business name, address, registration numbers
- For location: extract address, coordinates if mentioned
- For other types: extract relevant identifying information
- Be thorough but only include information that's explicitly stated or strongly implied
- Use proper formatting (dates as DD/MM/YYYY, phone numbers with country code)`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { 
              type: "string",
              enum: ["person", "organization", "location", "event", "vehicle", "phone", "email", "document", "symbol_diamond", "symbol_triangle", "symbol_square", "symbol_star", "symbol_hexagon"]
            },
            description: { type: "string" },
            attributes: { 
              type: "object",
              additionalProperties: true
            }
          },
          required: ["name", "type"]
        }
      });

      // Capitalize first letter of each word in name
      const capitalizeName = (name) => {
        return name.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      };

      // Process the result
      const processedResult = {
        ...result,
        name: result.name ? capitalizeName(result.name) : result.name,
        attributes: result.attributes || {}
      };

      // For person entities, ensure first_name and surname are set
      if (processedResult.type === 'person' && processedResult.name) {
        const nameParts = processedResult.name.split(' ');
        processedResult.attributes.first_name = nameParts[0] || '';
        processedResult.attributes.surname = nameParts.slice(1).join(' ') || '';
      }

      onCreate(processedResult);
      setPrompt('');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create entity from prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[#11141A] border-[#2D3742]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#E2E8F0]">
            <Sparkles className="w-5 h-5 text-[#00D4FF]" />
            Create Entity with AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm mb-3 text-[#94A3B8]">
              Describe the entity you want to create. Include any details like names, addresses, contact info, or other relevant information.
            </p>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., John Smith, CEO of Acme Corp, lives at 123 Main St, Sydney. Phone: +61 400 123 456. Previously worked at TechCo from 2015-2020."
              className="min-h-32 text-sm"
              disabled={loading}
            />
          </div>

          <div className="text-xs text-[#94A3B8]">
            <p className="font-medium mb-1">Examples:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>"Jane Doe, born 15/03/1985, lives in Melbourne. Works at ABC Ltd as Marketing Director."</li>
              <li>"XYZ Corporation, ABN 12 345 678 901, headquarters at 100 George St, Sydney NSW 2000"</li>
              <li>"Meeting with stakeholders on 15/12/2024 at City Hall regarding Project Phoenix"</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-[#0B0E13] font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Entity
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}