import React, { useEffect, useRef, useState } from 'react';
import { ENTITY_TYPES } from './EntityLibrary';
import { toast } from 'sonner';

// Icon drawing functions matching Lucide React icons
const drawPersonIcon = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Head circle
  ctx.beginPath();
  ctx.arc(x, y - size * 0.2, size * 0.2, 0, Math.PI * 2);
  ctx.stroke();
  
  // Body path (User icon shape)
  ctx.beginPath();
  ctx.arc(x, y + size * 0.35, size * 0.42, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
};

const drawBuildingIcon = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Building outline (Building2 icon)
  ctx.beginPath();
  ctx.rect(x - size * 0.35, y - size * 0.25, size * 0.35, size * 0.5);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.rect(x, y - size * 0.4, size * 0.35, size * 0.65);
  ctx.stroke();
  
  // Door
  ctx.beginPath();
  ctx.rect(x + size * 0.08, y + size * 0.05, size * 0.18, size * 0.2);
  ctx.stroke();
};

const drawHouseIcon = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // MapPin icon - outer circle
  ctx.beginPath();
  ctx.arc(x, y - size * 0.1, size * 0.35, -Math.PI * 0.8, Math.PI * 0.8);
  ctx.stroke();
  
  // Pin point
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y + size * 0.15);
  ctx.lineTo(x, y + size * 0.45);
  ctx.lineTo(x + size * 0.25, y + size * 0.15);
  ctx.stroke();
  
  // Inner circle
  ctx.beginPath();
  ctx.arc(x, y - size * 0.1, size * 0.15, 0, Math.PI * 2);
  ctx.stroke();
};

const drawCalendarIcon = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Calendar outline
  ctx.beginPath();
  ctx.roundRect(x - size * 0.35, y - size * 0.35, size * 0.7, size * 0.7, size * 0.06);
  ctx.stroke();
  
  // Top line
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.15);
  ctx.lineTo(x + size * 0.35, y - size * 0.15);
  ctx.stroke();
  
  // Top hooks
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.35);
  ctx.lineTo(x - size * 0.2, y - size * 0.45);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.35);
  ctx.lineTo(x + size * 0.2, y - size * 0.45);
  ctx.stroke();
};

const drawCarIcon = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Car body outline
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.15);
  ctx.lineTo(x - size * 0.35, y - size * 0.05);
  ctx.lineTo(x - size * 0.15, y - size * 0.25);
  ctx.lineTo(x + size * 0.15, y - size * 0.25);
  ctx.lineTo(x + size * 0.35, y - size * 0.05);
  ctx.lineTo(x + size * 0.45, y + size * 0.15);
  ctx.stroke();
  
  // Bottom line
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.15);
  ctx.lineTo(x + size * 0.45, y + size * 0.15);
  ctx.stroke();
  
  // Windshield separator
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25);
  ctx.lineTo(x, y - size * 0.05);
  ctx.stroke();
  
  // Wheels
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y + size * 0.15, size * 0.12, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(x + size * 0.3, y + size * 0.15, size * 0.12, 0, Math.PI * 2);
  ctx.stroke();
};

const drawPhoneIcon = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Phone outline
  ctx.beginPath();
  ctx.roundRect(x - size * 0.25, y - size * 0.4, size * 0.5, size * 0.8, size * 0.08);
  ctx.stroke();
  
  // Speaker line
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.3);
  ctx.lineTo(x + size * 0.1, y - size * 0.3);
  ctx.stroke();
  
  // Home button
  ctx.beginPath();
  ctx.arc(x, y + size * 0.3, size * 0.06, 0, Math.PI * 2);
  ctx.stroke();
};

const drawEmailIcon = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Envelope rectangle
  ctx.beginPath();
  ctx.rect(x - size * 0.4, y - size * 0.25, size * 0.8, size * 0.5);
  ctx.stroke();
  
  // Envelope flap
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.25);
  ctx.lineTo(x, y + size * 0.05);
  ctx.lineTo(x + size * 0.4, y - size * 0.25);
  ctx.stroke();
};

const drawDocumentIcon = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Document outline with folded corner
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.4);
  ctx.lineTo(x - size * 0.3, y + size * 0.4);
  ctx.lineTo(x + size * 0.3, y + size * 0.4);
  ctx.lineTo(x + size * 0.3, y - size * 0.2);
  ctx.lineTo(x + size * 0.1, y - size * 0.4);
  ctx.lineTo(x - size * 0.3, y - size * 0.4);
  ctx.stroke();
  
  // Folded corner
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.4);
  ctx.lineTo(x + size * 0.1, y - size * 0.2);
  ctx.lineTo(x + size * 0.3, y - size * 0.2);
  ctx.stroke();
  
  // Text lines
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.1);
  ctx.lineTo(x + size * 0.2, y - size * 0.1);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.05);
  ctx.lineTo(x + size * 0.2, y + size * 0.05);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.2);
  ctx.lineTo(x + size * 0.1, y + size * 0.2);
  ctx.stroke();
};

const drawDiamond = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = color + '20';
  ctx.lineWidth = size * 0.08;
  ctx.lineJoin = 'miter';
  
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.4);
  ctx.lineTo(x + size * 0.35, y);
  ctx.lineTo(x, y + size * 0.4);
  ctx.lineTo(x - size * 0.35, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const drawTriangle = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = color + '20';
  ctx.lineWidth = size * 0.08;
  ctx.lineJoin = 'miter';
  
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.4);
  ctx.lineTo(x + size * 0.35, y + size * 0.35);
  ctx.lineTo(x - size * 0.35, y + size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const drawSquare = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = color + '20';
  ctx.lineWidth = size * 0.08;
  ctx.lineJoin = 'miter';
  
  const s = size * 0.35;
  ctx.beginPath();
  ctx.rect(x - s, y - s, s * 2, s * 2);
  ctx.fill();
  ctx.stroke();
};

const drawStar = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = color + '20';
  ctx.lineWidth = size * 0.08;
  ctx.lineJoin = 'miter';
  
  const spikes = 5;
  const outerRadius = size * 0.4;
  const innerRadius = size * 0.18;
  
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const drawHexagon = (ctx, x, y, size, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = color + '20';
  ctx.lineWidth = size * 0.08;
  ctx.lineJoin = 'miter';
  
  const radius = size * 0.37;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 2;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const ICON_DRAWERS = {
  person: drawPersonIcon,
  organization: drawBuildingIcon,
  location: drawHouseIcon,
  event: drawCalendarIcon,
  vehicle: drawCarIcon,
  phone: drawPhoneIcon,
  email: drawEmailIcon,
  document: drawDocumentIcon,
  symbol_diamond: drawDiamond,
  symbol_triangle: drawTriangle,
  symbol_square: drawSquare,
  symbol_star: drawStar,
  symbol_hexagon: drawHexagon
};

export default function NetworkCanvas({ 
  entities, 
  selectedEntityId,
  onSelectEntity,
  onDoubleClickEntity,
  onUpdateEntityPosition,
  onRightClick,
  onCanvasRightClick,
  highlightedEntityIds,
  onExportCanvas,
  selectedEntities,
  onSelectedEntitiesChange,
  groups = [],
  onCreateRelationship,
  linkCreationSource,
  onCancelLinkCreation
}) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const localPositionsRef = useRef({});
  const [hoveredNode, setHoveredNode] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const initializedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lastClickRef = useRef({ time: 0, entityId: null });
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [draggingGroup, setDraggingGroup] = useState(false);
  const [groupDragOffset, setGroupDragOffset] = useState({});
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [linkSource, setLinkSource] = useState(null);
  const [linkPreviewEnd, setLinkPreviewEnd] = useState(null);



  // Initialize entity positions for entities without positions
  useEffect(() => {
    const newPositions = {};
    
    entities.forEach((entity, index) => {
      if (!entity.position && !localPositionsRef.current[entity.id]) {
        const angle = (index / entities.length) * Math.PI * 2;
        const radius = Math.min(dimensions.width, dimensions.height) * 0.3;
        newPositions[entity.id] = {
          x: dimensions.width / 2 + Math.cos(angle) * radius,
          y: dimensions.height / 2 + Math.sin(angle) * radius
        };
      }
    });
    
    if (Object.keys(newPositions).length > 0) {
      Object.entries(newPositions).forEach(([id, pos]) => {
        onUpdateEntityPosition(id, pos);
      });
    }
  }, [entities, dimensions, onUpdateEntityPosition]);

  // Handle canvas resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        setDimensions({
          width: canvasRef.current.offsetWidth,
          height: canvasRef.current.offsetHeight
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Track shift and space keys, plus keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle shortcuts if typing in input
      const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
      if (e.key === ' ' && !isTyping) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      
      // Zoom shortcuts
      if (!isTyping && (e.ctrlKey || e.metaKey)) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          resetView();
        }
      }
      
      // Pan with arrow keys
      if (!isTyping && !e.ctrlKey && !e.metaKey) {
        const panAmount = 50;
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setTransform(t => ({ ...t, y: t.y + panAmount }));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setTransform(t => ({ ...t, y: t.y - panAmount }));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setTransform(t => ({ ...t, x: t.x + panAmount }));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setTransform(t => ({ ...t, x: t.x - panAmount }));
        }
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
        setSelectionBox(null);
      }
      if (e.key === ' ') {
        setIsSpacePressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Zoom functions
  const zoomIn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    zoomAtPoint(centerX, centerY, 1.2);
  };

  const zoomOut = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    zoomAtPoint(centerX, centerY, 0.8);
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const zoomAtPoint = (clientX, clientY, scaleFactor) => {
    setTransform(prevTransform => {
      const newScale = Math.max(0.1, Math.min(3, prevTransform.scale * scaleFactor));
      
      // Calculate the point in canvas coordinates before zoom
      const pointX = (clientX - prevTransform.x) / prevTransform.scale;
      const pointY = (clientY - prevTransform.y) / prevTransform.scale;
      
      // Calculate new transform to keep the point at the same screen position
      const newX = clientX - pointX * newScale;
      const newY = clientY - pointY * newScale;
      
      return {
        x: newX,
        y: newY,
        scale: newScale
      };
    });
  };

  // Expose zoom controls to parent
  React.useImperativeHandle(onExportCanvas, () => ({
    exportAsImage: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/png');
      }
      return null;
    },
    zoomIn,
    zoomOut,
    resetView
  }));

  // Get entity position (local override or saved position)
  const getEntityPosition = (entity) => {
    if (localPositionsRef.current[entity.id]) {
      return localPositionsRef.current[entity.id];
    }
    return entity.position;
  };

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas with Palantir dark background
    ctx.fillStyle = '#0B0E13';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Apply transform
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // Draw relationship connections
    const relationships = entities.filter(e => e.type === 'relationship');
    relationships.forEach(rel => {
      const sourceEntity = entities.find(e => e.id === rel.attributes?.sourceEntityId);
      const targetEntity = entities.find(e => e.id === rel.attributes?.targetEntityId);
      const relPos = getEntityPosition(rel);
      
      if (sourceEntity && targetEntity && relPos) {
        const sourcePos = getEntityPosition(sourceEntity);
        const targetPos = getEntityPosition(targetEntity);
        
        const thickness = rel.attributes?.thickness || 3;
        const color = rel.color || '#64748b';
        const direction = rel.attributes?.direction || 'directed';
        
        // Draw line from source to relationship node
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(relPos.x, relPos.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.stroke();
        
        // Draw line from relationship node to target
        ctx.beginPath();
        ctx.moveTo(relPos.x, relPos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.stroke();
        
        // Draw arrow for directed relationships
        if (direction === 'directed') {
          const angle = Math.atan2(targetPos.y - relPos.y, targetPos.x - relPos.x);
          const arrowSize = 12;
          ctx.beginPath();
          ctx.moveTo(targetPos.x, targetPos.y);
          ctx.lineTo(
            targetPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
            targetPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            targetPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
            targetPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
    });

    // Draw link creation preview
    if (isCreatingLink && linkSource && linkPreviewEnd) {
      const sourcePos = getEntityPosition(linkSource);
      if (sourcePos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(linkPreviewEnd.x, linkPreviewEnd.y);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw groups
    groups.forEach(group => {
      if (!group.entity_ids || group.entity_ids.length === 0) return;

      const groupEntities = entities.filter(e => group.entity_ids.includes(e.id));
      if (groupEntities.length === 0) return;

      // Calculate bounding box
      const positions = groupEntities.map(e => getEntityPosition(e));
      const minX = Math.min(...positions.map(p => p.x)) - 30;
      const maxX = Math.max(...positions.map(p => p.x)) + 30;
      const minY = Math.min(...positions.map(p => p.y)) - 30;
      const maxY = Math.max(...positions.map(p => p.y)) + 30;

      // Draw group boundary
      ctx.strokeStyle = group.color || '#3b82f6';
      ctx.fillStyle = `${group.color || '#3b82f6'}10`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 10);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw group label
      ctx.fillStyle = group.color || '#3b82f6';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(group.name, minX + 10, minY - 10);
    });





    // Draw selection box
    if (selectionBox) {
      ctx.strokeStyle = '#3b82f6';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        selectionBox.x,
        selectionBox.y,
        selectionBox.width,
        selectionBox.height
      );
      ctx.fillRect(
        selectionBox.x,
        selectionBox.y,
        selectionBox.width,
        selectionBox.height
      );
      ctx.setLineDash([]);
    }

    // Draw nodes
    entities.forEach(entity => {
      const entityPos = getEntityPosition(entity);
      if (!entityPos) return;

      const config = ENTITY_TYPES[entity.type] || { color: '#64748b', label: 'Unknown' };
      const isSelected = entity.id === selectedEntityId;
      const isHovered = entity.id === hoveredNode;
      const isDragging = draggedNode && draggedNode.id === entity.id;
      const isHighlighted = highlightedEntityIds && highlightedEntityIds.includes(entity.id);
      const isDimmed = highlightedEntityIds && !isHighlighted;
      const isGroupSelected = selectedEntities.includes(entity.id);
      const isLinkSource = linkCreationSource && linkCreationSource.id === entity.id;
      
      // Special rendering for relationship nodes
      if (entity.type === 'relationship') {
        const nodeRadius = 10;
        
        // Apply dimming if needed
        if (isDimmed) {
          ctx.globalAlpha = 0.25;
        }
        
        // Draw shadow
        if (isSelected || isHovered || isDragging) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetY = 3;
        }
        
        // Draw relationship node (small diamond)
        ctx.beginPath();
        ctx.moveTo(entityPos.x, entityPos.y - nodeRadius);
        ctx.lineTo(entityPos.x + nodeRadius, entityPos.y);
        ctx.lineTo(entityPos.x, entityPos.y + nodeRadius);
        ctx.lineTo(entityPos.x - nodeRadius, entityPos.y);
        ctx.closePath();
        ctx.fillStyle = entity.color || '#64748b';
        ctx.fill();
        ctx.strokeStyle = isSelected || isHovered || isDragging ? '#ffffff' : entity.color || '#64748b';
        ctx.lineWidth = isSelected || isDragging ? 3 : 2;
        ctx.stroke();
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw label below
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const labelText = entity.name || 'Relationship';
        const labelWidth = ctx.measureText(labelText).width;
        
        // Label background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(
          entityPos.x - labelWidth / 2 - 4,
          entityPos.y + nodeRadius + 4,
          labelWidth + 8,
          16
        );
        
        // Label text
        ctx.fillStyle = entity.color || '#64748b';
        ctx.fillText(labelText, entityPos.x, entityPos.y + nodeRadius + 6);
        
        // Reset alpha
        if (isDimmed) {
          ctx.globalAlpha = 1;
        }
        
        return;
      }
      
      const nodeRadius = 30;
      const iconSize = 28;

      // Apply dimming for non-matching entities during search
      if (isDimmed) {
        ctx.globalAlpha = 0.25;
      }

      // Draw shadow
      if (isSelected || isHovered || isDragging || isHighlighted || isGroupSelected || isLinkSource) {
        ctx.shadowColor = isLinkSource ? 'rgba(59, 130, 246, 0.6)' :
                          isGroupSelected ? 'rgba(59, 130, 246, 0.5)' :
                          isHighlighted ? 'rgba(59, 130, 246, 0.4)' : 
                          isDragging ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = isLinkSource ? 40 : isGroupSelected ? 35 : isHighlighted ? 30 : isDragging ? 25 : 20;
        ctx.shadowOffsetY = isDragging ? 8 : 5;
      }

      // Draw background circle
      ctx.beginPath();
      ctx.arc(entityPos.x, entityPos.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Draw colored border
      ctx.strokeStyle = isLinkSource ? '#3b82f6' : isGroupSelected ? '#3b82f6' : (entity.color || config.color);
      ctx.lineWidth = isSelected || isDragging || isHighlighted || isGroupSelected || isLinkSource ? 4 : 3;
      ctx.stroke();

      // Draw extra highlight when dragging, search matched, group selected, or link source
      if (isDragging || isHighlighted || isGroupSelected || isLinkSource) {
        ctx.strokeStyle = isLinkSource ? '#3b82f6' :
                          isGroupSelected ? '#3b82f6' :
                          isHighlighted ? '#3b82f6' :
                          (entity.color || config.color);
        ctx.lineWidth = isLinkSource ? 8 : isGroupSelected ? 7 : isHighlighted ? 7 : 6;
        ctx.globalAlpha = isDimmed ? 0.1 : (isLinkSource || isHighlighted || isGroupSelected ? 0.6 : 0.4);
        ctx.stroke();
        ctx.globalAlpha = isDimmed ? 0.25 : 1;
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw custom shape if specified, otherwise draw icon or photo
      const customShape = entity.attributes?.shape;
      if (customShape && ICON_DRAWERS[customShape]) {
        ICON_DRAWERS[customShape](ctx, entityPos.x, entityPos.y, iconSize, entity.color || config.color);
      } else if (entity.type === 'person' && entity.attributes?.photo_url) {
        // Draw photo for person entities
        const img = new Image();
        img.src = entity.attributes.photo_url;
        if (img.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(entityPos.x, entityPos.y, nodeRadius - 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, entityPos.x - nodeRadius + 2, entityPos.y - nodeRadius + 2, (nodeRadius - 2) * 2, (nodeRadius - 2) * 2);
          ctx.restore();
        } else {
          // Fallback to icon while image loads
          const iconDrawer = ICON_DRAWERS[entity.type];
          if (iconDrawer) {
            iconDrawer(ctx, entityPos.x, entityPos.y, iconSize, entity.color || config.color);
          }
        }
      } else {
        // Draw icon for all other entities
        const iconDrawer = ICON_DRAWERS[entity.type];
        if (iconDrawer) {
          iconDrawer(ctx, entityPos.x, entityPos.y, iconSize, entity.color || config.color);
        }
      }

      // Draw file indicator for documents with files
      if (entity.type === 'document' && entity.attributes?.file_url) {
        ctx.beginPath();
        ctx.arc(entityPos.x + nodeRadius * 0.6, entityPos.y - nodeRadius * 0.6, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw hover highlight
      if (isHovered && !isDragging && !isDimmed) {
        ctx.beginPath();
        ctx.arc(entityPos.x, entityPos.y, nodeRadius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = entity.color || config.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.globalAlpha = isDimmed ? 0.25 : 1;
      }

      // Draw pulsing ring for highlighted entities or link source
      if (isHighlighted || isLinkSource) {
        ctx.beginPath();
        ctx.arc(entityPos.x, entityPos.y, nodeRadius + 5 + (isLinkSource ? Math.sin(Date.now() / 200) * 2 : 0), 0, Math.PI * 2);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = isLinkSource ? 4 : 3;
        ctx.globalAlpha = isLinkSource ? 0.7 : 0.5;
        ctx.stroke();
        ctx.globalAlpha = isDimmed ? 0.25 : 1;
      }

      // Draw label with enriched data or fallback
      const enriched = entity.attributes?.enriched;
      const displayName = enriched?.minimal || entity.attributes?.custom_label || entity.name;
      const tagline = enriched?.tagline || null;

      // Build details array based on entity type
      const details = [];
      const attrs = entity.attributes || {};

      if (entity.type === 'person') {
        // Display: Legal Name, Address, DOB
        if (attrs['Legal Name']) details.push(attrs['Legal Name']);
        if (attrs['Addresses']?.[0]?.street) details.push(attrs['Addresses'][0].street);
        if (attrs['Date of Birth']) details.push('DOB: ' + attrs['Date of Birth']);
      } else if (entity.type === 'organization') {
        // Display: Address, ABN, ACN
        if (attrs['Address']) details.push(attrs['Address']);
        if (attrs['ABN']) details.push('ABN: ' + attrs['ABN']);
        if (attrs['ACN']) details.push('ACN: ' + attrs['ACN']);
      } else if (entity.type === 'location') {
        if (attrs['Address']) details.push(attrs['Address']);
        if (attrs['State']) details.push(attrs['State']);
      } else if (entity.type === 'event') {
        if (attrs['Date']) details.push('Date: ' + attrs['Date']);
        if (attrs['Location']) details.push(attrs['Location']);
      } else if (entity.type === 'vehicle') {
        if (attrs['Registration']) details.push('Rego: ' + attrs['Registration']);
        if (attrs['Color']) details.push('Color: ' + attrs['Color']);
        if (attrs['State Registered']) details.push(attrs['State Registered']);
      } else if (entity.type === 'phone') {
        if (attrs['Number']) details.push(attrs['Number']);
      } else if (entity.type === 'email') {
        if (attrs['Email Address']) details.push(attrs['Email Address']);
      } else if (entity.type === 'document') {
        if (attrs['Date']) details.push('Date: ' + attrs['Date']);
        if (attrs['file_name']) details.push(attrs['file_name']);
      }

      // Render minimal + tagline layout
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const textY = entityPos.y + nodeRadius + 8;
      const lineHeight = 13;

      // Calculate widths
      const nameWidth = ctx.measureText(displayName).width;
      ctx.font = '9px Inter, sans-serif';
      const taglineWidth = tagline ? ctx.measureText(tagline).width : 0;
      const maxWidth = Math.max(nameWidth, taglineWidth);
      const totalHeight = tagline ? lineHeight * 2 : lineHeight;

      // Background
      ctx.fillStyle = isHighlighted ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(
        entityPos.x - maxWidth / 2 - 6,
        textY - 2,
        maxWidth + 12,
        totalHeight + 4
      );

      // Name (bold)
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = isHighlighted ? '#3b82f6' : '#1e293b';
      ctx.fillText(displayName, entityPos.x, textY + 2);

      // Tagline (smaller, muted)
      if (tagline) {
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = isHighlighted ? '#3b82f6' : '#64748b';
        ctx.fillText(tagline, entityPos.x, textY + 2 + lineHeight);
      }
      
      // Reset alpha
      if (isDimmed) {
        ctx.globalAlpha = 1;
      }
    });

    ctx.restore();
  });

  // Animation loop for smooth rendering
  useEffect(() => {
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const screenToCanvas = (screenX, screenY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - transform.x) / transform.scale,
      y: (screenY - rect.top - transform.y) / transform.scale
    };
  };

  const getNodeAtPosition = (x, y) => {
    return entities.find(entity => {
      const pos = getEntityPosition(entity);
      if (!pos) return false;
      const dx = pos.x - x;
      const dy = pos.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });
  };

  const handleMouseDown = (e) => {
    if (!e) return;
    if (e.button === 2) return; // Ignore right-click in mousedown
    
    const pos = screenToCanvas(e.clientX, e.clientY);
    const node = getNodeAtPosition(pos.x, pos.y);

    // Ctrl key for link creation
    if (e.ctrlKey || e.metaKey) {
      if (node && node.type !== 'relationship') {
        e.preventDefault();
        setIsCreatingLink(true);
        setLinkSource(node);
        setLinkPreviewEnd(pos);
        return;
      }
    }

    // Space key for panning
    if (isSpacePressed || e.button === 1) { // Space or middle mouse button
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      return;
    }

    // Shift + drag for selection box or group move
    if (isShiftPressed) {
      e.preventDefault();
      if (node && selectedEntities.includes(node.id)) {
        // Start dragging selected group
        setDraggingGroup(true);
        const offsets = {};
        selectedEntities.forEach(entityId => {
          const entity = entities.find(e => e.id === entityId);
          if (entity) {
            const entityPos = getEntityPosition(entity);
            offsets[entityId] = {
              x: pos.x - entityPos.x,
              y: pos.y - entityPos.y
            };
            localPositionsRef.current[entityId] = entityPos;
          }
        });
        setGroupDragOffset(offsets);
      } else {
        // Start selection box
        setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
        onSelectedEntitiesChange([]);
      }
      return;
    }

    // Handle double-click detection
    if (node) {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickRef.current.time;
      
      if (timeSinceLastClick < 400 && lastClickRef.current.entityId === node.id) {
        // Double-click detected
        e.stopPropagation();
        if (node.type === 'document' && node.attributes?.file_url) {
          window.open(node.attributes.file_url, '_blank');
        }
        onDoubleClickEntity(node);
        lastClickRef.current = { time: 0, entityId: null };
        return;
      }
      
      lastClickRef.current = { time: now, entityId: node.id };
    }

    // Handle link creation mode
    if (linkCreationSource && node && node.id !== linkCreationSource.id && node.type !== 'relationship') {
      e.preventDefault();
      const sourcePos = getEntityPosition(linkCreationSource);
      const targetPos = getEntityPosition(node);
      const midPos = {
        x: (sourcePos.x + targetPos.x) / 2,
        y: (sourcePos.y + targetPos.y) / 2
      };
      
      if (onCreateRelationship) {
        onCreateRelationship(linkCreationSource, node, midPos);
      }
      
      if (onCancelLinkCreation) {
        onCancelLinkCreation();
      }
      return;
    } else if (linkCreationSource && !node) {
      // Clicked on empty canvas - cancel link creation
      if (onCancelLinkCreation) {
        onCancelLinkCreation();
      }
      return;
    }

    if (node) {
      // Always allow dragging nodes
      const nodePos = getEntityPosition(node);
      setDraggedNode(node);
      setDragOffset({
        x: pos.x - nodePos.x,
        y: pos.y - nodePos.y
      });
      localPositionsRef.current[node.id] = nodePos;
      onSelectEntity(node);
      onSelectedEntitiesChange([]);
    } else if (e.button === 0 && !node) {
      // Start panning on empty canvas click
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
      onSelectedEntitiesChange([]);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const pos = screenToCanvas(e.clientX, e.clientY);
    const node = getNodeAtPosition(pos.x, pos.y);
    
    if (node) {
      onRightClick(node, e.clientX, e.clientY);
    } else if (onCanvasRightClick) {
      onCanvasRightClick(e.clientX, e.clientY);
    }
  };

  const handleMouseMove = (e) => {
    if (!e) return;
    const pos = screenToCanvas(e.clientX, e.clientY);

    // Update link creation preview
    if (isCreatingLink && linkSource) {
      setLinkPreviewEnd(pos);
      return;
    }

    if (selectionBox && isShiftPressed) {
      // Update selection box
      const newBox = {
        x: Math.min(selectionBox.x, pos.x),
        y: Math.min(selectionBox.y, pos.y),
        width: Math.abs(pos.x - selectionBox.x),
        height: Math.abs(pos.y - selectionBox.y)
      };
      setSelectionBox(newBox);

      // Find entities within selection box
      const selected = entities.filter(entity => {
        const entityPos = getEntityPosition(entity);
        if (!entityPos) return false;
        return entityPos.x >= newBox.x &&
               entityPos.x <= newBox.x + newBox.width &&
               entityPos.y >= newBox.y &&
               entityPos.y <= newBox.y + newBox.height;
      }).map(e => e.id);
      onSelectedEntitiesChange(selected);
    } else if (draggingGroup && isShiftPressed) {
      // Move all selected entities
      e.preventDefault();
      selectedEntities.forEach(entityId => {
        const offset = groupDragOffset[entityId];
        if (offset) {
          localPositionsRef.current[entityId] = {
            x: pos.x - offset.x,
            y: pos.y - offset.y
          };
        }
      });
    } else if (draggedNode) {
      e.preventDefault();
      const newPos = {
        x: pos.x - dragOffset.x,
        y: pos.y - dragOffset.y
      };
      localPositionsRef.current[draggedNode.id] = newPos;
    } else if (isPanning) {
      setTransform({
        ...transform,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else {
      const node = getNodeAtPosition(pos.x, pos.y);
      setHoveredNode(node?.id || null);
      setHoveredEntity(node || null);
      if (node) {
        setHoverPosition({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!e) return;
    
    // Handle link creation completion
    if (isCreatingLink && linkSource) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      const targetNode = getNodeAtPosition(pos.x, pos.y);
      
      if (targetNode && targetNode.id !== linkSource.id && targetNode.type !== 'relationship') {
        // Create relationship in the middle
        const sourcePos = getEntityPosition(linkSource);
        const targetPos = getEntityPosition(targetNode);
        const midPos = {
          x: (sourcePos.x + targetPos.x) / 2,
          y: (sourcePos.y + targetPos.y) / 2
        };
        
        if (onCreateRelationship) {
          onCreateRelationship(linkSource, targetNode, midPos);
        }
      }
      
      setIsCreatingLink(false);
      setLinkSource(null);
      setLinkPreviewEnd(null);
      return;
    }
    
    if (selectionBox) {
      setSelectionBox(null);
    }

    if (draggingGroup) {
      // Save all group positions
      selectedEntities.forEach(entityId => {
        if (localPositionsRef.current[entityId]) {
          onUpdateEntityPosition(entityId, localPositionsRef.current[entityId]);
        }
      });
      setDraggingGroup(false);
      setGroupDragOffset({});
    }
    
    if (draggedNode && localPositionsRef.current[draggedNode.id]) {
      // Save the final position to database
      onUpdateEntityPosition(draggedNode.id, localPositionsRef.current[draggedNode.id]);
    }
    
    setDraggedNode(null);
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Determine zoom direction and apply smoother scaling
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoomAtPoint(mouseX, mouseY, delta);
  };

  // Determine cursor style
  const getCursorStyle = () => {
    if (draggingGroup) return 'grabbing';
    if (draggedNode) return 'grabbing';
    if (isPanning) return 'grabbing';
    if (isSpacePressed) return 'grab';
    if (linkCreationSource) return 'crosshair';
    if (isShiftPressed) return 'crosshair';
    if (hoveredNode) return 'move';
    return 'default';
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredEntity(null);
        }}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        style={{ cursor: getCursorStyle() }}
      />
      {(isCreatingLink || linkCreationSource) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-lg pointer-events-none">
          {linkCreationSource ? 
            `Creating link from "${linkCreationSource.name}" - Click target entity or press Escape to cancel` :
            'Creating Link: Click target entity'}
        </div>
      )}
      {isShiftPressed && !isCreatingLink && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-lg pointer-events-none">
          Selection Mode: Drag to select entities
        </div>
      )}
      {isSpacePressed && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg pointer-events-none">
          Pan Mode: Drag to pan
        </div>
      )}
      <div className="absolute bottom-4 right-4 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-lg pointer-events-none text-xs space-y-1 text-slate-600">
        <div><strong>Zoom:</strong> Scroll / Ctrl +/- / Ctrl 0</div>
        <div><strong>Pan:</strong> Space + Drag / Arrow Keys</div>
        <div><strong>Select:</strong> Shift + Drag</div>
        <div><strong>Link:</strong> Ctrl + Drag from entity</div>
      </div>
      {selectedEntities.length > 0 && (
        <div className="absolute top-4 right-4 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-lg pointer-events-none">
          {selectedEntities.length} entities selected
        </div>
      )}
      {hoveredEntity && !draggedNode && !draggingGroup && !selectionBox && (
        <div 
          className="absolute bg-slate-900 text-white rounded-lg shadow-2xl p-3 pointer-events-none z-50 max-w-xs border border-slate-700"
          style={{
            left: `${hoverPosition.x + 10}px`,
            top: `${hoverPosition.y - 10}px`
          }}
        >
          {hoveredEntity.attributes?.enriched ? (
            // Enriched hover
            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
                {(() => {
                  const config = ENTITY_TYPES[hoveredEntity.type];
                  const Icon = config?.icon;
                  return Icon ? (
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/10"
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  ) : null;
                })()}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{hoveredEntity.attributes.enriched.minimal}</h4>
                  <p className="text-xs text-slate-400">{hoveredEntity.attributes.enriched.tagline}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {hoveredEntity.attributes.enriched.hover.map((line, i) => (
                  <div key={i} className="text-xs flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span className="text-slate-200 leading-relaxed">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Fallback for non-enriched
            <div>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const config = ENTITY_TYPES[hoveredEntity.type];
                  const Icon = config?.icon;
                  return Icon ? (
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/10"
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  ) : null;
                })()}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{hoveredEntity.name}</h4>
                  <p className="text-xs text-slate-400 capitalize">{hoveredEntity.type}</p>
                </div>
              </div>
              {hoveredEntity.description && (
                <p className="text-xs text-slate-300 line-clamp-3">{hoveredEntity.description}</p>
              )}
              <div className="mt-2 pt-2 border-t border-slate-700">
                <p className="text-xs text-slate-500 italic">Loading enrichment...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}