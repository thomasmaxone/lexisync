import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2 } from "lucide-react";
import LabelCombobox from './LabelCombobox';

export default function RelationshipEditDialog({ 
  isOpen, 
  onClose, 
  relationship, 
  onSave,
  onDelete,
  entities
}) {
  const [formData, setFormData] = useState({
    label: '',
    color: '#64748b',
    thickness: 3,
    direction: 'directed'
  });

  useEffect(() => {
    if (relationship) {
      setFormData({
        label: relationship.name || '',
        color: relationship.color || '#64748b',
        thickness: relationship.attributes?.thickness || 3,
        direction: relationship.attributes?.direction || 'directed'
      });
    }
  }, [relationship]);

  const handleSave = () => {
    onSave({
      ...relationship,
      name: formData.label,
      color: formData.color,
      attributes: {
        ...relationship.attributes,
        thickness: formData.thickness,
        direction: formData.direction
      }
    });
    onClose();
  };

  const sourceEntity = entities.find(e => e.id === relationship?.attributes?.sourceEntityId);
  const targetEntity = entities.find(e => e.id === relationship?.attributes?.targetEntityId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Relationship</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Connection Info */}
          {sourceEntity && targetEntity && (
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <span className="font-medium">{sourceEntity.name}</span>
              <span className="mx-2">→</span>
              <span className="font-medium">{targetEntity.name}</span>
            </div>
          )}

          {/* Label */}
          <div>
            <Label htmlFor="label">Relationship Label *</Label>
            <div className="mt-1.5">
              <LabelCombobox
                value={formData.label}
                onChange={(value) => setFormData({ ...formData, label: value })}
                isRelationship={true}
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 p-1"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 h-10"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Thickness */}
          <div>
            <Label htmlFor="thickness">Line Thickness: {formData.thickness}</Label>
            <Slider
              id="thickness"
              min={1}
              max={10}
              step={1}
              value={[formData.thickness]}
              onValueChange={(value) => setFormData({ ...formData, thickness: value[0] })}
              className="mt-2"
            />
          </div>

          {/* Direction */}
          <div>
            <Label htmlFor="direction">Direction</Label>
            <Select
              value={formData.direction}
              onValueChange={(value) => setFormData({ ...formData, direction: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="directed">Directed (A → B)</SelectItem>
                <SelectItem value="undirected">Undirected (A ↔ B)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={!formData.label.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}