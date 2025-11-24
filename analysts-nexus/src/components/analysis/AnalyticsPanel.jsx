import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, TrendingUp, Users, Link2, GitBranch, 
  Target, AlertTriangle, BarChart3, Network, Circle
} from 'lucide-react';
import { ENTITY_TYPES } from './EntityLibrary';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function AnalyticsPanel({ entities, links, onClose, onSelectEntity }) {
  const [pathSource, setPathSource] = useState('');
  const [pathTarget, setPathTarget] = useState('');

  // Calculate network statistics
  const stats = useMemo(() => {
    const entityConnections = {};
    entities.forEach(e => entityConnections[e.id] = 0);
    
    links.forEach(link => {
      if (entityConnections[link.source_entity_id] !== undefined) {
        entityConnections[link.source_entity_id]++;
      }
      if (entityConnections[link.target_entity_id] !== undefined) {
        entityConnections[link.target_entity_id]++;
      }
    });

    const avgConnections = entities.length > 0 
      ? Object.values(entityConnections).reduce((a, b) => a + b, 0) / entities.length 
      : 0;

    const avgStrength = links.length > 0
      ? links.reduce((sum, link) => sum + (link.strength || 5), 0) / links.length
      : 0;

    return {
      totalEntities: entities.length,
      totalLinks: links.length,
      avgConnections: avgConnections.toFixed(1),
      avgStrength: avgStrength.toFixed(1),
      entityConnections
    };
  }, [entities, links]);

  // Most connected entities (centrality)
  const mostConnected = useMemo(() => {
    return entities
      .map(entity => ({
        entity,
        connections: stats.entityConnections[entity.id] || 0
      }))
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 10);
  }, [entities, stats]);

  // Strongest relationships
  const strongestLinks = useMemo(() => {
    return links
      .map(link => ({
        link,
        source: entities.find(e => e.id === link.source_entity_id),
        target: entities.find(e => e.id === link.target_entity_id)
      }))
      .filter(item => item.source && item.target)
      .sort((a, b) => (b.link.strength || 5) - (a.link.strength || 5))
      .slice(0, 10);
  }, [links, entities]);

  // Weakest relationships
  const weakestLinks = useMemo(() => {
    return links
      .map(link => ({
        link,
        source: entities.find(e => e.id === link.source_entity_id),
        target: entities.find(e => e.id === link.target_entity_id)
      }))
      .filter(item => item.source && item.target)
      .sort((a, b) => (a.link.strength || 5) - (b.link.strength || 5))
      .slice(0, 10);
  }, [links, entities]);

  // Entity type distribution
  const typeDistribution = useMemo(() => {
    const distribution = {};
    entities.forEach(entity => {
      distribution[entity.type] = (distribution[entity.type] || 0) + 1;
    });
    return Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));
  }, [entities]);

  // Cluster detection (entities with many shared connections)
  const clusters = useMemo(() => {
    const entityLinks = {};
    entities.forEach(e => entityLinks[e.id] = new Set());
    
    links.forEach(link => {
      if (entityLinks[link.source_entity_id]) {
        entityLinks[link.source_entity_id].add(link.target_entity_id);
      }
      if (entityLinks[link.target_entity_id]) {
        entityLinks[link.target_entity_id].add(link.source_entity_id);
      }
    });

    const clustersFound = [];
    const visited = new Set();

    entities.forEach(entity => {
      if (visited.has(entity.id)) return;
      
      const cluster = new Set([entity.id]);
      const queue = [entity.id];
      
      while (queue.length > 0) {
        const currentId = queue.shift();
        visited.add(currentId);
        
        const connections = entityLinks[currentId] || new Set();
        connections.forEach(connectedId => {
          if (!visited.has(connectedId) && !cluster.has(connectedId)) {
            cluster.add(connectedId);
            queue.push(connectedId);
          }
        });
      }
      
      if (cluster.size > 1) {
        clustersFound.push({
          entities: Array.from(cluster).map(id => entities.find(e => e.id === id)).filter(Boolean),
          size: cluster.size
        });
      }
    });

    return clustersFound.sort((a, b) => b.size - a.size).slice(0, 5);
  }, [entities, links]);

  // Pathfinding (BFS)
  const findPath = useMemo(() => {
    if (!pathSource || !pathTarget || pathSource === pathTarget) return null;

    const graph = {};
    entities.forEach(e => graph[e.id] = []);
    
    links.forEach(link => {
      graph[link.source_entity_id]?.push(link.target_entity_id);
      graph[link.target_entity_id]?.push(link.source_entity_id);
    });

    const queue = [[pathSource]];
    const visited = new Set([pathSource]);

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === pathTarget) {
        return path.map(id => entities.find(e => e.id === id)).filter(Boolean);
      }

      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return null;
  }, [pathSource, pathTarget, entities, links]);

  // Anomalies (isolated entities or unusual patterns)
  const anomalies = useMemo(() => {
    const isolated = entities.filter(entity => {
      const hasLinks = links.some(
        link => link.source_entity_id === entity.id || link.target_entity_id === entity.id
      );
      return !hasLinks;
    });

    const highConnections = entities.filter(entity => {
      const connections = stats.entityConnections[entity.id] || 0;
      return connections > stats.avgConnections * 3;
    });

    return { isolated, highConnections };
  }, [entities, links, stats]);

  return (
    <div className="w-96 flex-shrink-0 border-l flex flex-col bg-white border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Analytics</h2>
              <p className="text-xs text-slate-500">Network insights</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="pathfinding">Paths</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Network Stats */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-900">
                  <Network className="w-4 h-4" />
                  Network Statistics
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Entities</span>
                    <span className="font-semibold text-slate-900">{stats.totalEntities}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Links</span>
                    <span className="font-semibold text-slate-900">{stats.totalLinks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Avg Connections</span>
                    <span className="font-semibold text-slate-900">{stats.avgConnections}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Avg Link Strength</span>
                    <span className="font-semibold text-slate-900">{stats.avgStrength}/10</span>
                  </div>
                </div>
              </Card>

              {/* Type Distribution */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-900">
                  <Users className="w-4 h-4" />
                  Entity Distribution
                </h3>
                <div className="space-y-4">
                  {typeDistribution.length > 0 && (
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={typeDistribution.map(d => ({ 
                              name: ENTITY_TYPES[d.type]?.label || d.type, 
                              value: d.count,
                              type: d.type
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            dataKey="value"
                          >
                            {typeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={ENTITY_TYPES[entry.type]?.color || '#64748b'} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="space-y-2">
                    {typeDistribution.map(({ type, count }) => {
                      const config = ENTITY_TYPES[type];
                      const percentage = stats.totalEntities > 0 ? ((count / stats.totalEntities) * 100).toFixed(0) : 0;
                      return (
                        <div key={type} className="flex items-center gap-2">
                          <Circle className="w-3 h-3" style={{ fill: config?.color || '#64748b', stroke: 'none' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-600 capitalize">{config?.label || type}</span>
                              <span className="font-semibold text-slate-900">{count} ({percentage}%)</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: config?.color || '#64748b'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Most Connected */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-900">
                  <Target className="w-4 h-4" />
                  Most Connected (Centrality)
                </h3>
                <div className="space-y-2">
                  {mostConnected.slice(0, 5).map(({ entity, connections }) => {
                    const config = ENTITY_TYPES[entity.type];
                    return (
                      <button
                        key={entity.id}
                        onClick={() => onSelectEntity(entity)}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div 
                            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${config?.color || '#64748b'}15` }}
                          >
                            {config?.icon && <config.icon className="w-3 h-3" style={{ color: config.color }} />}
                          </div>
                          <span className="text-sm truncate text-slate-700">{entity.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-900">{connections}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {/* Strongest Links */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-900">
                  <TrendingUp className="w-4 h-4" />
                  Strongest Relationships
                </h3>
                <div className="space-y-2">
                  {strongestLinks.slice(0, 5).map(({ link, source, target }) => (
                    <div key={link.id} className="p-2 rounded bg-slate-50">
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="font-medium truncate text-slate-700">{source.name}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-medium truncate text-slate-700">{target.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{link.label}</span>
                        <span className="text-xs font-semibold text-slate-900">{link.strength}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Clusters */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-900">
                  <GitBranch className="w-4 h-4" />
                  Network Clusters
                </h3>
                <div className="space-y-2">
                  {clusters.map((cluster, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700">Cluster {idx + 1}</span>
                        <span className="text-xs text-slate-500">{cluster.size} entities</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cluster.entities.slice(0, 3).map(entity => (
                          <button
                            key={entity.id}
                            onClick={() => onSelectEntity(entity)}
                            className="text-xs px-2 py-1 rounded bg-white hover:bg-slate-100 transition-colors text-slate-600"
                          >
                            {entity.name}
                          </button>
                        ))}
                        {cluster.size > 3 && (
                          <span className="text-xs px-2 py-1 text-slate-400">+{cluster.size - 3}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {clusters.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No clusters detected</p>
                  )}
                </div>
              </Card>

              {/* Anomalies */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-900">
                  <AlertTriangle className="w-4 h-4" />
                  Anomalies
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-2 text-slate-600">Isolated Entities</p>
                    {anomalies.isolated.length > 0 ? (
                      <div className="space-y-1">
                        {anomalies.isolated.slice(0, 3).map(entity => (
                          <button
                            key={entity.id}
                            onClick={() => onSelectEntity(entity)}
                            className="w-full text-left text-xs p-2 rounded bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600"
                          >
                            {entity.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">None</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2 text-slate-600">Highly Connected (3x avg)</p>
                    {anomalies.highConnections.length > 0 ? (
                      <div className="space-y-1">
                        {anomalies.highConnections.slice(0, 3).map(entity => (
                          <button
                            key={entity.id}
                            onClick={() => onSelectEntity(entity)}
                            className="w-full flex justify-between text-xs p-2 rounded bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <span className="text-slate-600">{entity.name}</span>
                            <span className="font-semibold text-slate-900">{stats.entityConnections[entity.id]}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">None</p>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="pathfinding" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-900">
                  <Link2 className="w-4 h-4" />
                  Find Connection Path
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-slate-600">From Entity</label>
                    <Select value={pathSource} onValueChange={setPathSource}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select source..." />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.map(entity => (
                          <SelectItem key={entity.id} value={entity.id}>
                            {entity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-slate-600">To Entity</label>
                    <Select value={pathTarget} onValueChange={setPathTarget}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select target..." />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.map(entity => (
                          <SelectItem key={entity.id} value={entity.id}>
                            {entity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {pathSource && pathTarget && (
                    <div className="mt-4 p-3 rounded-lg bg-slate-50">
                      <p className="text-xs font-medium mb-2 text-slate-600">Connection Path</p>
                      {findPath ? (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-500 mb-2">{findPath.length} steps</p>
                          {findPath.map((entity, idx) => (
                            <div key={entity.id}>
                              <button
                                onClick={() => onSelectEntity(entity)}
                                className="w-full text-left text-xs p-2 rounded bg-white hover:bg-slate-100 transition-colors text-slate-700"
                              >
                                {idx + 1}. {entity.name}
                              </button>
                              {idx < findPath.length - 1 && (
                                <div className="flex justify-center py-1">
                                  <div className="text-slate-400">↓</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No path found</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}