import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';

export default function GroupDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  group = null,
  selectedEntities = [],
  allEntities = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    entity_ids: []
  });

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        color: group.color || '#3b82f6',
        entity_ids: group.entity_ids || []
      });
    } else if (selectedEntities.length > 0) {
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        entity_ids: selectedEntities
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        entity_ids: []
      });
    }
  }, [group, selectedEntities, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  const handleRemoveEntity = (entityId) => {
    setFormData({
      ...formData,
      entity_ids: formData.entity_ids.filter(id => id !== entityId)
    });
  };

  const handleAddEntity = (entityId) => {
    if (!formData.entity_ids.includes(entityId)) {
      setFormData({
        ...formData,
        entity_ids: [...formData.entity_ids, entityId]
      });
    }
  };

  const availableEntities = allEntities.filter(
    entity => !formData.entity_ids.includes(entity.id)
  );

  const groupEntities = allEntities.filter(
    entity => formData.entity_ids.includes(entity.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{group ? 'Edit Group' : 'Create Group'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="group-name">Group Name *</Label>
            <Input
              id="group-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Board of Directors, Inner Circle"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Purpose or notes about this group..."
              className="mt-1.5 h-20"
            />
          </div>

          <div>
            <Label htmlFor="group-color">Group Color</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <Input
                id="group-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-9 p-1"
              />
              <span className="text-sm text-slate-600">
                Used for group boundary and highlighting
              </span>
            </div>
          </div>

          <div>
            <Label>Entities in Group ({formData.entity_ids.length})</Label>
            <div className="mt-2 space-y-2">
              {groupEntities.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-slate-50">
                  {groupEntities.map(entity => (
                    <Badge 
                      key={entity.id} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {entity.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveEntity(entity.id)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-2">No entities in this group yet</p>
              )}

              {availableEntities.length > 0 && (
                <Select onValueChange={handleAddEntity}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add entity to group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEntities.map(entity => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
              {group ? 'Update' : 'Create'} Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}