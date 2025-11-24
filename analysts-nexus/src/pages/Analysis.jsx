import React, { useState, useEffect, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import EntityLibrary from "../components/analysis/EntityLibrary";
import NetworkCanvas from "../components/analysis/NetworkCanvas";
import PropertiesPanel from "../components/analysis/PropertiesPanel";
import Toolbar from "../components/analysis/Toolbar";
import ContextMenu from "../components/analysis/ContextMenu";
import AISuggestionsPanel from "../components/analysis/AISuggestionsPanel";
import AIEntityDialog from "../components/analysis/AIEntityDialog";
import AnalyzeDocumentDialog from "../components/analysis/AnalyzeDocumentDialog";
import AISuggestionOptionsDialog from "../components/analysis/AISuggestionOptionsDialog";
import AnalyticsPanel from "../components/analysis/AnalyticsPanel";
import GroupDialog from "../components/analysis/GroupDialog";
import EntitySearchDialog from "../components/analysis/EntitySearchDialog";
import RelationshipEditDialog from "../components/analysis/RelationshipEditDialog";
import ImportCSVDialog from "../components/analysis/ImportCSVDialog";
import AddEntityDialog from "../components/analysis/AddEntityDialog";
import CreateLinkDialog from "../components/analysis/CreateLinkDialog";
import { applyHierarchicalLayout, applyCircularLayout, applyGridLayout, applyForceLayout } from "../components/analysis/LayoutAlgorithms";
import { enrichmentService } from "../components/analysis/EntityEnrichmentService";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Analysis() {
  const queryClient = useQueryClient();
  const [canvases, setCanvases] = useState([{ id: 'canvas-1', name: 'Canvas 1' }]);
  const [activeCanvasId, setActiveCanvasId] = useState('canvas-1');
  const [editingCanvasId, setEditingCanvasId] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showProperties, setShowProperties] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, entity: null });
  const [canvasContextMenu, setCanvasContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const canvasExportRef = useRef(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [showAIEntityDialog, setShowAIEntityDialog] = useState(false);
  const [showAnalyzeDocDialog, setShowAnalyzeDocDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAISuggestionOptions, setShowAISuggestionOptions] = useState(false);
  const [groups, setGroups] = useState([]);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [history, setHistory] = useState([]);
  const [showEntitySearch, setShowEntitySearch] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState(null);
  const [showRelationshipDialog, setShowRelationshipDialog] = useState(false);
  const [linkCreationSource, setLinkCreationSource] = useState(null);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showAddEntityDialog, setShowAddEntityDialog] = useState(false);
  const [addEntityPosition, setAddEntityPosition] = useState(null);
  const [showCreateLinkDialog, setShowCreateLinkDialog] = useState(false);
  const [linkSourceEntity, setLinkSourceEntity] = useState(null);
  const [linkTargetEntity, setLinkTargetEntity] = useState(null);

  // Fetch all entities and links
  const { data: allEntities = [], isLoading: entitiesLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: () => base44.entities.Entity.list('-updated_date', 1000)
  });

  // Filter entities for active canvas
  const entities = allEntities.filter(e => e.attributes?.canvas_id === activeCanvasId);

  // Create entity mutation
  const createEntityMutation = useMutation({
    mutationFn: (data) => {
      // Validate name before creating
      if (!data.name || !data.name.trim()) {
        throw new Error('Entity name is required');
      }
      // Add canvas_id to attributes
      const entityData = {
        ...data,
        attributes: {
          ...data.attributes,
          canvas_id: activeCanvasId
        }
      };
      return base44.entities.Entity.create(entityData);
    },
    onSuccess: async (newEntity, variables, context) => {
      queryClient.setQueryData(['entities'], (old) => [...(old || []), newEntity]);
      
      // Auto-enrich entity (skip for relationship nodes and if disabled)
      if (newEntity.type !== 'relationship' && !context?.skipEnrichment) {
        enrichEntityAsync(newEntity);
      }
      
      // Only show toast if not from AI (AI creation will show its own)
      if (!context?.fromAI) {
        toast.success('Entity created');
      }
      // Add to history for undo (skip for imports)
      if (!context?.fromAI && !context?.fromImport) {
        setHistory(prev => [...prev, { type: 'entity_create', entity: newEntity }]);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create entity');
    }
  });

  // Enrich entity in background
  const enrichEntityAsync = async (entity) => {
    try {
      const enriched = await enrichmentService.enrichEntity(
        entity.name,
        entity.type,
        {
          description: entity.description,
          attributes: entity.attributes
        }
      );

      // Update entity with enriched data
      await updateEntityMutation.mutateAsync({
        id: entity.id,
        data: {
          ...entity,
          attributes: {
            ...entity.attributes,
            enriched: enriched,
            enriched_at: new Date().toISOString()
          }
        }
      }, {
        onSuccess: () => {
          // Silent update - no toast
        }
      });
    } catch (error) {
      console.error('Background enrichment failed:', error);
      // Silent fail - don't bother user
    }
  };

  // Update entity mutation
  const updateEntityMutation = useMutation({
    mutationFn: ({ id, data }) => {
      // Validate name before updating
      if (!data.name || !data.name.trim()) {
        throw new Error('Entity name is required');
      }
      return base44.entities.Entity.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entities']);
      toast.success('Entity updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update entity');
    }
  });

  // Delete entity mutation
  const deleteEntityMutation = useMutation({
    mutationFn: (id) => base44.entities.Entity.delete(id),
    onSuccess: (_, entityId) => {
      const deletedEntity = entities.find(e => e.id === entityId);
      queryClient.invalidateQueries(['entities']);
      setSelectedEntity(null);
      setShowProperties(false);
      toast.success('Entity deleted');
      // Add to history for undo
      if (deletedEntity) {
        setHistory(prev => [...prev, { type: 'entity_delete', entity: deletedEntity }]);
      }
    }
  });

  const handleSelectEntity = (entity) => {
    setSelectedEntity(entity);
  };

  const handleDoubleClickEntity = (entity) => {
    if (entity.type === 'relationship') {
      setEditingRelationship(entity);
      setShowRelationshipDialog(true);
    } else {
      setSelectedEntity(entity);
      setShowProperties(true);
    }
  };

  const handleRightClick = (entity, x, y) => {
    setContextMenu({ show: true, x, y, entity });
  };

  const handleContextEdit = () => {
    setSelectedEntity(contextMenu.entity);
    setShowProperties(true);
    setContextMenu({ show: false, x: 0, y: 0, entity: null });
  };

  const handleContextCreateLink = () => {
    setLinkCreationSource(contextMenu.entity);
    setContextMenu({ show: false, x: 0, y: 0, entity: null });
    toast.info('Click on target entity to create link');
  };



  const handleContextDelete = async () => {
    const entity = contextMenu.entity;
    
    // If deleting a regular entity, also delete all relationships connected to it
    if (entity.type !== 'relationship') {
      const connectedRelationships = allEntities.filter(e => 
        e.type === 'relationship' && 
        (e.attributes?.sourceEntityId === entity.id || e.attributes?.targetEntityId === entity.id)
      );
      
      if (connectedRelationships.length > 0) {
        if (!confirm(`Delete this entity and ${connectedRelationships.length} connected relationship(s)?`)) {
          setContextMenu({ show: false, x: 0, y: 0, entity: null });
          return;
        }
        
        // Delete all connected relationships first
        for (const rel of connectedRelationships) {
          await base44.entities.Entity.delete(rel.id);
        }
      } else if (!confirm('Delete this entity?')) {
        setContextMenu({ show: false, x: 0, y: 0, entity: null });
        return;
      }
    } else if (!confirm('Delete this relationship?')) {
      setContextMenu({ show: false, x: 0, y: 0, entity: null });
      return;
    }
    
    deleteEntityMutation.mutate(entity.id);
    setContextMenu({ show: false, x: 0, y: 0, entity: null });
  };

  const handleCreateEntity = (position) => {
    setAddEntityPosition(position || null);
    setShowAddEntityDialog(true);
  };

  const handleAddEntity = (entityType) => {
    setAddEntityPosition(null);
    setShowAddEntityDialog(true);
  };

  const handleAddCanvas = () => {
    const newId = `canvas-${Date.now()}`;
    setCanvases([...canvases, { id: newId, name: `Canvas ${canvases.length + 1}` }]);
    setActiveCanvasId(newId);
  };

  const handleCloseCanvas = async (canvasId) => {
    if (canvases.length === 1) {
      toast.error('Cannot close the last canvas');
      return;
    }
    
    // Delete all entities for this canvas
    const canvasEntities = allEntities.filter(e => e.attributes?.canvas_id === canvasId);
    
    for (const entity of canvasEntities) {
      await base44.entities.Entity.delete(entity.id);
    }
    
    queryClient.invalidateQueries(['entities']);
    
    const newCanvases = canvases.filter(c => c.id !== canvasId);
    setCanvases(newCanvases);
    if (activeCanvasId === canvasId) {
      setActiveCanvasId(newCanvases[0].id);
    }
  };

  const handleRenameCanvas = (canvasId, newName) => {
    if (newName && newName.trim()) {
      setCanvases(canvases.map(c => c.id === canvasId ? { ...c, name: newName.trim() } : c));
      setEditingCanvasId(null);
    }
  };

  const handleUpdateEntity = (data) => {
    // Validate name
    if (!data.name || !data.name.trim()) {
      toast.error('Entity name is required');
      return;
    }

    if (selectedEntity && selectedEntity.id) {
      updateEntityMutation.mutate({ id: selectedEntity.id, data });
      setShowProperties(false);
    } else {
      // Add default center position for new entities
      const entityData = {
        ...data,
        position: data.position || { x: 400, y: 300 }
      };
      createEntityMutation.mutate(entityData);
      setShowProperties(false);
    }
  };

  const handleDeleteEntity = () => {
    if (selectedEntity && confirm('Delete this entity?')) {
      deleteEntityMutation.mutate(selectedEntity.id);
    }
  };

  // Handle keyboard delete and close context menus on click
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't delete if user is typing in an input/textarea
      const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      
      // Cmd+K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowEntitySearch(true);
        return;
      }

      if (isTyping) return;

      // Cancel link creation with Escape
      if (e.key === 'Escape' && linkCreationSource) {
        setLinkCreationSource(null);
        toast.info('Link creation cancelled');
        return;
      }

      // Undo with Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        
        if (selectedEntities.length > 0) {
          if (confirm(`Delete ${selectedEntities.length} selected entities?`)) {
            selectedEntities.forEach(id => deleteEntityMutation.mutate(id));
            setSelectedEntities([]);
          }
        } else if (selectedEntity) {
          if (confirm('Delete this entity?')) {
            deleteEntityMutation.mutate(selectedEntity.id);
            setSelectedEntity(null);
          }
        }
      }
    };

    const handleClick = () => {
      setCanvasContextMenu({ show: false, x: 0, y: 0 });
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, [selectedEntity, selectedEntities, deleteEntityMutation, history, linkCreationSource]);

  const handleUpdatePosition = (entityId, position) => {
    const entity = entities.find(e => e.id === entityId);
    if (entity) {
      // Update immediately without notification
      updateEntityMutation.mutate(
        {
          id: entityId,
          data: { ...entity, position }
        },
        {
          onSuccess: () => {
            // Silent update
          }
        }
      );
    }
  };



  const handleCanvasRightClick = (x, y) => {
    // Store canvas position for entity creation
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const canvasX = (x - rect.left) / 1; // Adjust for transform if needed
      const canvasY = (y - rect.top) / 1;
      setCanvasContextMenu({ show: true, x, y, canvasPos: { x: canvasX, y: canvasY } });
    } else {
      setCanvasContextMenu({ show: true, x, y });
    }
  };

  // Filter entities based on search
  const filteredEntityIds = React.useMemo(() => {
    if (!searchTerm.trim()) return null;
    
    const term = searchTerm.toLowerCase();
    return entities
      .filter(entity => {
        const nameMatch = entity.name.toLowerCase().includes(term);
        const typeMatch = entity.type.toLowerCase().includes(term);
        return nameMatch || typeMatch;
      })
      .map(e => e.id);
  }, [entities, searchTerm]);

  const handleExportData = () => {
    const data = {
      entities,
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-data-${Date.now()}.json`;
    a.click();
    toast.success('Data exported');
  };

  const handleExportCanvas = () => {
    if (canvasExportRef.current) {
      const imageData = canvasExportRef.current.exportAsImage();
      if (imageData) {
        const a = document.createElement('a');
        a.href = imageData;
        a.download = `analysis-canvas-${Date.now()}.png`;
        a.click();
        toast.success('Canvas exported as image');
      }
    }
  };

  const handlePrintCanvas = () => {
    if (canvasExportRef.current) {
      const imageData = canvasExportRef.current.exportAsImage();
      if (imageData) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Intelligence Analysis - Print</title>
              <style>
                body { margin: 0; padding: 20px; }
                img { max-width: 100%; height: auto; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              <img src="${imageData}" onload="window.print();"/>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleShareCanvas = async () => {
    if (canvasExportRef.current) {
      const imageData = canvasExportRef.current.exportAsImage();
      if (imageData) {
        try {
          const blob = await fetch(imageData).then(r => r.blob());
          const file = new File([blob], 'analysis.png', { type: 'image/png' });
          
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Intelligence Analysis',
              files: [file]
            });
            toast.success('Canvas shared');
          } else {
            // Fallback - copy to clipboard
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            toast.success('Canvas copied to clipboard');
          }
        } catch (err) {
          toast.error('Share not supported - canvas exported instead');
          handleExportCanvas();
        }
      }
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.entities || data.entities.length === 0) {
          toast.error('No entities found in file');
          return;
        }
        
        // Import entities
        let imported = 0;
        let skipped = 0;
        
        for (const entity of data.entities) {
          const { id, created_date, updated_date, created_by, ...entityData } = entity;
          
          // Validate required fields
          if (!entityData.name || !entityData.name.trim() || !entityData.type) {
            console.warn('Skipping invalid entity:', entityData);
            skipped++;
            continue;
          }
          
          try {
            await createEntityMutation.mutateAsync(entityData, { context: { fromAI: true } });
            imported++;
          } catch (error) {
            console.error('Failed to import entity:', entityData, error);
            skipped++;
          }
        }
        
        if (imported > 0) {
          toast.success(`${imported} entities imported${skipped > 0 ? `, ${skipped} skipped` : ''}`);
        } else {
          toast.error('No valid entities could be imported');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast.error('Failed to import file: ' + error.message);
      }
    };
    input.click();
  };

  const handleAISuggestions = () => {
    if (entities.length < 2) {
      toast.error('Need at least 2 entities to suggest relationships');
      return;
    }
    setShowAISuggestionOptions(true);
  };

  const handleProceedWithAISuggestions = async (options) => {
    setShowAISuggestions(true);
    setAiLoading(true);
    setAiError(null);
    setAiSuggestions([]);

    try {
      const entityData = entities.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        description: e.description || '',
        attributes: e.attributes || {}
      }));

      let prompt = `You are an intelligence analyst. Analyze these entities and suggest potential relationships between them.

  IMPORTANT: Use the exact "id" values from the entity data below for source_id and target_id fields.

  Entities:
  ${JSON.stringify(entityData, null, 2)}

  `;

      if (options.mode === 'specific' && options.pattern) {
        prompt += `
  SPECIFIC PATTERN REQUEST:
  The user is looking for: ${options.pattern}

  Focus your analysis on finding relationships that match this specific pattern or connection type. Only suggest relationships that are relevant to this request.

  `;
      }

      prompt += `Instructions:
  1. Carefully analyze entity names, types, descriptions, and attributes
  2. Look for concrete evidence of relationships in the data
  3. For person-to-organization: Check if person works for, is employed by, or is associated with organization
  4. For person-to-person: Check for family relationships, professional connections, shared attributes
  5. For phone/email to person: If phone/email attributes match person's contact info
  6. For person-to-location: Check if person's address matches a location
  7. For person/organization to document: Check if names or entities are mentioned
  8. ONLY suggest relationships where you have evidence from the data
  9. Use EXACT id values from the entities list above
  10. Provide confidence scores (0-1) based on strength of evidence found
  11. Suggest 3-8 most relevant and well-evidenced relationships

  For each suggestion you MUST:
  - Use the exact "id" field from the entity as source_id and target_id
  - Provide specific reasoning based on actual data you see
  - Set appropriate relationship strength (1-10) based on evidence quality
  - Choose accurate relationship_type (works_for, knows, related_to, owns, manages, contacts, located_at, partners_with, etc.)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  source_id: { type: "string" },
                  target_id: { type: "string" },
                  source_name: { type: "string" },
                  target_name: { type: "string" },
                  relationship_type: { type: "string" },
                  label: { type: "string" },
                  reasoning: { type: "string" },
                  confidence: { type: "number" },
                  strength: { type: "number" }
                }
              }
            }
          }
        }
      });

      setAiSuggestions(result.suggestions || []);
      if (result.suggestions?.length === 0) {
        toast.info('No new relationships suggested');
      }
    } catch (error) {
      console.error(error);
      setAiError(error.message || 'Failed to generate suggestions');
      toast.error('Failed to generate AI suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSuggestion = (suggestion) => {
    // TODO: Implement after new linking system is built
    toast.info('Link creation will be implemented in the new system');
    setAiSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const handleRejectSuggestion = (index) => {
    setAiSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleModifySuggestion = (suggestion) => {
    // TODO: Implement after new linking system is built
    toast.info('Link editing will be implemented in the new system');
    setAiSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const handleAICreateEntity = async (entityData) => {
    try {
      // Validate name
      if (!entityData.name || !entityData.name.trim()) {
        toast.error('Entity name is required');
        return;
      }

      // Add default center position for new entities
      const dataWithPosition = {
        ...entityData,
        position: entityData.position || { x: 400, y: 300 }
      };
      const newEntity = await createEntityMutation.mutateAsync(dataWithPosition, {
        context: { fromAI: true }
      });
      setSelectedEntity(newEntity);
      setShowProperties(true);
      toast.success('Entity created from AI');
    } catch (error) {
      console.error('Failed to create entity:', error);
      toast.error('Failed to create entity');
    }
  };

  const handleCreateEntitiesFromDocument = async (entitiesToCreate) => {
    if (!entitiesToCreate || entitiesToCreate.length === 0) {
      toast.info('No entities selected to create');
      return;
    }

    try {
      const created = [];
      for (const entityData of entitiesToCreate) {
        // Validate required fields
        if (!entityData.name || !entityData.name.trim() || !entityData.type) {
          console.warn('Skipping entity - missing name or type:', entityData);
          continue;
        }

        // Add default position
        const dataWithPosition = {
          ...entityData,
          position: entityData.position || { 
            x: 200 + Math.random() * 400, 
            y: 200 + Math.random() * 200 
          }
        };
        
        const newEntity = await createEntityMutation.mutateAsync(dataWithPosition, {
          context: { fromAI: true }
        });
        created.push(newEntity);
      }
      
      if (created.length > 0) {
        toast.success(`${created.length} entities added from document`);
      } else {
        toast.warning('No valid entities could be created from document');
      }
    } catch (error) {
      console.error('Failed to create entities:', error);
      toast.error('Failed to create entities: ' + error.message);
    }
    };

    const handleCreateGroup = () => {
      if (selectedEntities.length === 0) {
        toast.error('Please select entities to group');
        return;
      }
      setEditingGroup(null);
      setShowGroupDialog(true);
    };

    const handleAddEntityFromSearch = async (sourceEntity) => {
      try {
        // Create a copy of the entity on the current canvas
        const { id, created_date, updated_date, created_by, ...entityData } = sourceEntity;
        const newEntity = await createEntityMutation.mutateAsync({
          ...entityData,
          position: {
            x: 200 + Math.random() * 400,
            y: 200 + Math.random() * 200
          }
        }, { context: { fromAI: true } });

        toast.success(`Added ${sourceEntity.name} to current canvas`);
      } catch (error) {
        console.error('Failed to add entity:', error);
        toast.error('Failed to add entity');
      }
    };

    const handleSaveGroup = (groupData) => {
    if (editingGroup) {
      setGroups(groups.map(g => g.id === editingGroup.id ? { ...groupData, id: editingGroup.id } : g));
      toast.success('Group updated');
    } else {
      setGroups([...groups, { ...groupData, id: `group-${Date.now()}` }]);
      toast.success('Group created');
    }
    setShowGroupDialog(false);
    setEditingGroup(null);
    };

  const handleUndo = async () => {
    if (history.length === 0) return;
    
    const lastAction = history[history.length - 1];
    
    try {
      if (lastAction.type === 'entity_create') {
        await base44.entities.Entity.delete(lastAction.entity.id);
        queryClient.invalidateQueries(['entities']);
        toast.success('Undone: Entity creation');
      } else if (lastAction.type === 'entity_delete') {
        const { id, created_date, updated_date, created_by, ...entityData } = lastAction.entity;
        await base44.entities.Entity.create(entityData);
        queryClient.invalidateQueries(['entities']);
        toast.success('Undone: Entity deletion');
      }
      
      setHistory(prev => prev.slice(0, -1));
    } catch (error) {
      toast.error('Failed to undo: ' + error.message);
    }
  };

    const handleApplyLayout = (layoutType) => {
    if (selectedEntities.length === 0) {
      toast.error('Please select entities to arrange');
      return;
    }

    const selectedEntityObjects = entities.filter(e => selectedEntities.includes(e.id));

    let newPositions = {};

    switch (layoutType) {
      case 'hierarchical':
        newPositions = applyHierarchicalLayout(selectedEntityObjects, []);
        toast.success('Applied hierarchical layout');
        break;
      case 'circular':
        newPositions = applyCircularLayout(selectedEntityObjects);
        toast.success('Applied circular layout');
        break;
      case 'grid':
        newPositions = applyGridLayout(selectedEntityObjects);
        toast.success('Applied grid layout');
        break;
      case 'force':
        newPositions = applyForceLayout(selectedEntityObjects, []);
        toast.success('Applied force-directed layout');
        break;
    }

    // Update positions for all selected entities
    Object.entries(newPositions).forEach(([entityId, position]) => {
      const entity = entities.find(e => e.id === entityId);
      if (entity) {
        updateEntityMutation.mutate(
          {
            id: entityId,
            data: { ...entity, position }
          },
          {
            onSuccess: () => {
              // Silent update
            }
          }
        );
      }
    });

    setSelectedEntities([]);
  };

  const handleCreateRelationship = (sourceEntity, targetEntity, position) => {
    setLinkSourceEntity(sourceEntity);
    setLinkTargetEntity(targetEntity);
    setShowCreateLinkDialog(true);
    setLinkCreationSource(null);
  };

  const handleCreateLinkFromDialog = (linkData) => {
    const sourcePos = linkSourceEntity.position || { x: 400, y: 300 };
    const targetPos = linkTargetEntity.position || { x: 500, y: 300 };
    const midPos = {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2
    };

    const relationshipData = {
      name: linkData.label,
      type: 'relationship',
      color: '#64748b',
      position: midPos,
      attributes: {
        sourceEntityId: linkSourceEntity.id,
        targetEntityId: linkTargetEntity.id,
        label: linkData.label,
        reverseLabel: linkData.reverseLabel,
        thickness: 3,
        direction: linkData.direction,
        canvas_id: activeCanvasId
      }
    };
    
    createEntityMutation.mutate(relationshipData, {
      context: { fromAI: true, skipEnrichment: true }
    });
  };

  const handleSaveRelationship = (relationshipData) => {
    updateEntityMutation.mutate({ id: relationshipData.id, data: relationshipData });
  };

  const handleImportCSV = async (entities) => {
    if (!entities || entities.length === 0) {
      toast.info('No entities to import');
      return;
    }

    try {
      let imported = 0;
      let skipped = 0;
      
      // Calculate grid positions for auto-placement
      const cols = Math.ceil(Math.sqrt(entities.length));
      const startX = 100;
      const startY = 100;
      const spacingX = 150;
      const spacingY = 150;
      
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        
        // Validate required fields
        if (!entity.name || !entity.name.trim()) {
          console.warn('Skipping entity without name:', entity);
          skipped++;
          continue;
        }
        
        // Calculate position in grid
        const row = Math.floor(i / cols);
        const col = i % cols;
        const position = {
          x: startX + (col * spacingX),
          y: startY + (row * spacingY)
        };
        
        try {
          await createEntityMutation.mutateAsync({
            ...entity,
            position
          }, { context: { fromAI: true } });
          imported++;
        } catch (error) {
          console.error('Failed to import entity:', entity, error);
          skipped++;
        }
      }
      
      if (imported > 0) {
        toast.success(`Imported ${imported} entities successfully${skipped > 0 ? `, ${skipped} skipped` : ''}`);
      } else {
        toast.error('No entities could be imported');
      }
    } catch (error) {
      console.error('CSV import failed:', error);
      toast.error('Failed to import entities: ' + error.message);
    }
  };

  const handleDeleteRelationship = () => {
    if (editingRelationship && confirm('Delete this relationship?')) {
      deleteEntityMutation.mutate(editingRelationship.id);
      setShowRelationshipDialog(false);
      setEditingRelationship(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0B0E13]">
      {/* Header */}
      <div className="h-16 flex items-center justify-center px-6 border-b bg-[#FFFFFF] border-[#E5E7EB]">
        <div className="flex items-center justify-between w-full">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6920df23bc3c86556eac642a/00bc176dd_grok_image_xocwdos.jpg"
                alt="LexiSync Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-[#000000]">LexiSync</h1>
                <p className="text-xs text-[#000000]">Link Analysis & Visualization</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-all duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="text-2xl font-bold text-[#000000] tracking-tight">{entities.length}</div>
                    <div className="text-[10px] uppercase tracking-widest text-[#000000] font-medium">Entities</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-all duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <div className="text-2xl font-bold text-[#000000] tracking-tight">
                      {allEntities.filter(e => e.type === 'relationship').length}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-[#000000] font-medium">Total Links</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        onZoomIn={() => canvasExportRef.current?.zoomIn()}
        onZoomOut={() => canvasExportRef.current?.zoomOut()}
        onResetView={() => canvasExportRef.current?.resetView()}
        onExportData={handleExportData}
        onExportCanvas={handleExportCanvas}
        onPrintCanvas={handlePrintCanvas}
        onShareCanvas={handleShareCanvas}
        onImport={handleImport}
        onImportCSV={() => setShowImportCSV(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAISuggestions={handleAISuggestions}
        onAICreateEntity={() => setShowAIEntityDialog(true)}
        onAnalyzeDocument={() => setShowAnalyzeDocDialog(true)}
        onAddEntity={handleAddEntity}
        onShowAnalytics={() => setShowAnalytics(true)}
        onCreateGroup={handleCreateGroup}
        onApplyLayout={handleApplyLayout}
        hasSelection={selectedEntities.length > 0}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        onSearchEntities={() => setShowEntitySearch(true)}
      />

      {/* Canvas Tabs */}
      <div className="h-12 border-b px-4 flex items-center gap-2 bg-[#11141A] border-[#2D3742] overflow-x-auto">
        {canvases.map((canvas) => (
          <div
            key={canvas.id}
            className={cn(
              "flex items-center gap-2 px-4 h-8 rounded-t border border-b-0 transition-all duration-200",
              activeCanvasId === canvas.id
                ? "bg-[#0B0E13] border-[#00D4FF]"
                : "bg-[#181C24] border-[#2D3742] hover:bg-[#1E2530] hover:border-[#00D4FF]/50"
            )}
          >
            {editingCanvasId === canvas.id ? (
              <input
                type="text"
                defaultValue={canvas.name}
                autoFocus
                className="text-sm font-medium text-[#E5E7EB] bg-transparent border-none outline-none w-32"
                onBlur={(e) => handleRenameCanvas(canvas.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameCanvas(canvas.id, e.target.value);
                  } else if (e.key === 'Escape') {
                    setEditingCanvasId(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span 
                className="text-sm font-medium text-[#E5E7EB] cursor-pointer hover:text-[#00D4FF] transition-colors duration-150"
                onClick={() => setActiveCanvasId(canvas.id)}
                onDoubleClick={() => setEditingCanvasId(canvas.id)}
              >
                {canvas.name}
              </span>
            )}
            {canvases.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${canvas.name}" and all its entities?`)) {
                    handleCloseCanvas(canvas.id);
                  }
                }}
                className="text-[#94A3B8] hover:text-[#FF4D6B] transition-colors duration-150"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddCanvas}
          className="h-8 text-[#94A3B8] hover:text-[#00D4FF] transition-colors duration-150"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 min-w-0 relative bg-[#0B0E13]">
          {entities.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded bg-[#181C24] border border-[#2D3742] flex items-center justify-center">
                  <Plus className="w-8 h-8 text-[#00D4FF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#E2E8F0] mb-2">No Entities Yet</h3>
                <p className="text-sm text-[#94A3B8] mb-4">
                  Add entities from the library or use AI to get started
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-[#94A3B8]">
                  <span className="px-2 py-1 bg-[#181C24] border border-[#2D3742] rounded">0 entities</span>
                </div>
              </div>
            </div>
          )}
          <NetworkCanvas
          entities={entities}
          selectedEntityId={selectedEntity?.id}
          onSelectEntity={handleSelectEntity}
          onDoubleClickEntity={handleDoubleClickEntity}
          onUpdateEntityPosition={handleUpdatePosition}
          onRightClick={handleRightClick}
          onCanvasRightClick={handleCanvasRightClick}
          highlightedEntityIds={filteredEntityIds}
          onExportCanvas={canvasExportRef}
          selectedEntities={selectedEntities}
          onSelectedEntitiesChange={setSelectedEntities}
          groups={groups}
          onCreateRelationship={handleCreateRelationship}
          linkCreationSource={linkCreationSource}
          onCancelLinkCreation={() => setLinkCreationSource(null)}
          />
        </div>

        {/* Properties Panel */}
        {showProperties && (
          <div className="flex-shrink-0">
            <PropertiesPanel
              entity={selectedEntity}
              onUpdate={handleUpdateEntity}
              onDelete={handleDeleteEntity}
              onClose={() => setShowProperties(false)}
            />
          </div>
        )}

        {/* AI Suggestions Panel */}
        {showAISuggestions && (
          <AISuggestionsPanel
            suggestions={aiSuggestions}
            onAccept={handleAcceptSuggestion}
            onReject={handleRejectSuggestion}
            onModify={handleModifySuggestion}
            onClose={() => setShowAISuggestions(false)}
            loading={aiLoading}
            error={aiError}
          />
        )}

        {/* Analytics Panel */}
        {showAnalytics && (
          <AnalyticsPanel
            entities={entities}
            links={[]}
            onClose={() => setShowAnalytics(false)}
            onSelectEntity={(entity) => {
              setSelectedEntity(entity);
              setShowProperties(true);
            }}
          />
        )}
      </div>

      {/* AI Entity Dialog */}
      <AIEntityDialog
        isOpen={showAIEntityDialog}
        onClose={() => setShowAIEntityDialog(false)}
        onCreate={handleAICreateEntity}
      />

      {/* Analyze Document Dialog */}
      <AnalyzeDocumentDialog
        isOpen={showAnalyzeDocDialog}
        onClose={() => setShowAnalyzeDocDialog(false)}
        onCreateEntities={handleCreateEntitiesFromDocument}
      />

      {/* AI Suggestion Options Dialog */}
      <AISuggestionOptionsDialog
        isOpen={showAISuggestionOptions}
        onClose={() => setShowAISuggestionOptions(false)}
        onProceed={handleProceedWithAISuggestions}
      />

      {/* Group Dialog */}
      <GroupDialog
        isOpen={showGroupDialog}
        onClose={() => {
          setShowGroupDialog(false);
          setEditingGroup(null);
        }}
        onSave={handleSaveGroup}
        group={editingGroup}
        selectedEntities={selectedEntities}
        allEntities={entities}
      />

      {/* Entity Search Dialog */}
      <EntitySearchDialog
        isOpen={showEntitySearch}
        onClose={() => setShowEntitySearch(false)}
        allEntities={allEntities}
        currentCanvasId={activeCanvasId}
        onAddToCanvas={handleAddEntityFromSearch}
      />

      {/* Relationship Edit Dialog */}
      <RelationshipEditDialog
        isOpen={showRelationshipDialog}
        onClose={() => {
          setShowRelationshipDialog(false);
          setEditingRelationship(null);
        }}
        relationship={editingRelationship}
        onSave={handleSaveRelationship}
        onDelete={handleDeleteRelationship}
        entities={entities}
      />

      {/* Import CSV Dialog */}
      <ImportCSVDialog
        isOpen={showImportCSV}
        onClose={() => setShowImportCSV(false)}
        onImport={handleImportCSV}
      />

      {/* Add Entity Dialog */}
      <AddEntityDialog
        isOpen={showAddEntityDialog}
        onClose={() => {
          setShowAddEntityDialog(false);
          setAddEntityPosition(null);
        }}
        onCreate={(entityData) => {
          createEntityMutation.mutate(entityData, { context: { fromAI: true } });
        }}
        position={addEntityPosition}
      />

      {/* Create Link Dialog */}
      <CreateLinkDialog
        isOpen={showCreateLinkDialog}
        onClose={() => {
          setShowCreateLinkDialog(false);
          setLinkSourceEntity(null);
          setLinkTargetEntity(null);
        }}
        sourceEntity={linkSourceEntity}
        targetEntity={linkTargetEntity}
        onCreateLink={handleCreateLinkFromDialog}
      />

      {/* Context Menu */}
      {contextMenu.show && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          entity={contextMenu.entity}
          onEdit={handleContextEdit}
          onDelete={handleContextDelete}
          onCreateLink={handleContextCreateLink}
          onClose={() => setContextMenu({ show: false, x: 0, y: 0, entity: null })}
        />
      )}

      {/* Canvas Context Menu */}
      {canvasContextMenu.show && (
        <div
          className="fixed rounded border py-1 z-50 bg-[#181C24] border-[#2D3742] shadow-lg"
          style={{ left: canvasContextMenu.x, top: canvasContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleCreateEntity(canvasContextMenu.canvasPos);
              setCanvasContextMenu({ show: false, x: 0, y: 0 });
            }}
            className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-[#E2E8F0] hover:bg-[#1E2530] hover:text-[#00D4FF] transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Add New Entity
          </button>
        </div>
      )}
    </div>
  );
}