// Layout algorithms for arranging entities in different structures

export const LAYOUT_TYPES = {
  HIERARCHICAL: 'hierarchical',
  CIRCULAR: 'circular',
  GRID: 'grid',
  FORCE: 'force'
};

/**
 * Hierarchical layout - top-down tree structure
 * Good for organizational charts, command structures
 */
export function applyHierarchicalLayout(entities, links, rootId = null) {
  const positions = {};
  const levels = {};
  const children = {};
  
  // Build parent-child relationships
  entities.forEach(e => children[e.id] = []);
  links.forEach(link => {
    if (!children[link.source_entity_id]) children[link.source_entity_id] = [];
    children[link.source_entity_id].push(link.target_entity_id);
  });

  // Find root (entity with no incoming links or specified root)
  let root = rootId;
  if (!root) {
    const hasIncoming = new Set(links.map(l => l.target_entity_id));
    root = entities.find(e => !hasIncoming.has(e.id))?.id || entities[0]?.id;
  }

  // BFS to assign levels
  const queue = [{ id: root, level: 0 }];
  const visited = new Set();
  
  while (queue.length > 0) {
    const { id, level } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    levels[id] = level;
    
    (children[id] || []).forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, level: level + 1 });
      }
    });
  }

  // Group by level
  const levelGroups = {};
  Object.entries(levels).forEach(([id, level]) => {
    if (!levelGroups[level]) levelGroups[level] = [];
    levelGroups[level].push(id);
  });

  // Position entities
  const levelHeight = 150;
  const nodeSpacing = 200;
  
  Object.entries(levelGroups).forEach(([level, ids]) => {
    const y = parseInt(level) * levelHeight + 100;
    const totalWidth = ids.length * nodeSpacing;
    const startX = -totalWidth / 2 + nodeSpacing / 2;
    
    ids.forEach((id, index) => {
      positions[id] = {
        x: startX + index * nodeSpacing,
        y
      };
    });
  });

  return positions;
}

/**
 * Circular layout - entities arranged in a circle
 * Good for peer networks, criminal cells
 */
export function applyCircularLayout(entities, centerX = 400, centerY = 300, radius = 200) {
  const positions = {};
  const angleStep = (2 * Math.PI) / entities.length;
  
  entities.forEach((entity, index) => {
    const angle = index * angleStep;
    positions[entity.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  return positions;
}

/**
 * Grid layout - entities in a grid pattern
 * Good for organized data display
 */
export function applyGridLayout(entities, startX = 100, startY = 100, columns = 5, spacing = 150) {
  const positions = {};
  
  entities.forEach((entity, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    positions[entity.id] = {
      x: startX + col * spacing,
      y: startY + row * spacing
    };
  });

  return positions;
}

/**
 * Force-directed layout - simulated physics
 * Good for organic network visualization
 */
export function applyForceLayout(entities, links, iterations = 50) {
  const positions = {};
  const velocities = {};
  
  // Initialize random positions
  entities.forEach(entity => {
    positions[entity.id] = entity.position || {
      x: 400 + (Math.random() - 0.5) * 400,
      y: 300 + (Math.random() - 0.5) * 300
    };
    velocities[entity.id] = { x: 0, y: 0 };
  });

  const repulsionStrength = 5000;
  const attractionStrength = 0.01;
  const damping = 0.85;

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all nodes
    entities.forEach(e1 => {
      entities.forEach(e2 => {
        if (e1.id === e2.id) return;
        
        const dx = positions[e2.id].x - positions[e1.id].x;
        const dy = positions[e2.id].y - positions[e1.id].y;
        const distSq = dx * dx + dy * dy + 0.01;
        const force = repulsionStrength / distSq;
        
        velocities[e1.id].x -= (dx / Math.sqrt(distSq)) * force;
        velocities[e1.id].y -= (dy / Math.sqrt(distSq)) * force;
      });
    });

    // Attraction along links
    links.forEach(link => {
      const source = positions[link.source_entity_id];
      const target = positions[link.target_entity_id];
      if (!source || !target) return;
      
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      
      velocities[link.source_entity_id].x += dx * attractionStrength;
      velocities[link.source_entity_id].y += dy * attractionStrength;
      velocities[link.target_entity_id].x -= dx * attractionStrength;
      velocities[link.target_entity_id].y -= dy * attractionStrength;
    });

    // Update positions with damping
    entities.forEach(entity => {
      velocities[entity.id].x *= damping;
      velocities[entity.id].y *= damping;
      positions[entity.id].x += velocities[entity.id].x;
      positions[entity.id].y += velocities[entity.id].y;
    });
  }

  return positions;
}