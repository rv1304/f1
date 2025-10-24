/**
 * VelocityForge Collision Detection System
 * 
 * Efficient collision detection using spatial partitioning for high-performance
 * multi-agent scenarios.
 */

import { Vector3 } from '../utils/Vector3.js';

export class CollisionDetector {
  constructor() {
    this.spatialGrid = new Map();
    this.gridSize = 50; // Grid cell size for spatial partitioning
    this.collisionPairs = new Set();
  }

  /**
   * Detect collisions between all agents
   */
  detectCollisions(agents) {
    const collisions = [];
    
    // Clear previous spatial grid
    this.spatialGrid.clear();
    
    // Populate spatial grid
    this.populateSpatialGrid(agents);
    
    // Check for collisions using spatial partitioning
    for (const [cellKey, cellAgents] of this.spatialGrid) {
      // Check collisions within the same cell
      for (let i = 0; i < cellAgents.length; i++) {
        for (let j = i + 1; j < cellAgents.length; j++) {
          const collision = this.checkAgentCollision(cellAgents[i], cellAgents[j]);
          if (collision) {
            collisions.push(collision);
          }
        }
      }
      
      // Check collisions with neighboring cells
      this.checkNeighboringCells(cellKey, cellAgents, collisions);
    }
    
    return collisions;
  }

  /**
   * Populate spatial grid with agents
   */
  populateSpatialGrid(agents) {
    for (const agent of agents) {
      if (!agent.physics) continue;
      
      const position = agent.physics.position;
      const cellKey = this.getCellKey(position);
      
      if (!this.spatialGrid.has(cellKey)) {
        this.spatialGrid.set(cellKey, []);
      }
      
      this.spatialGrid.get(cellKey).push(agent);
    }
  }

  /**
   * Get cell key for spatial partitioning
   */
  getCellKey(position) {
    const x = Math.floor(position.x / this.gridSize);
    const y = Math.floor(position.y / this.gridSize);
    const z = Math.floor(position.z / this.gridSize);
    return `${x},${y},${z}`;
  }

  /**
   * Check collisions with neighboring cells
   */
  checkNeighboringCells(cellKey, cellAgents, collisions) {
    const [x, y, z] = cellKey.split(',').map(Number);
    
    // Check 8 neighboring cells (3D)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue; // Skip self
          
          const neighborKey = `${x + dx},${y + dy},${z + dz}`;
          const neighborAgents = this.spatialGrid.get(neighborKey);
          
          if (neighborAgents) {
            for (const agent1 of cellAgents) {
              for (const agent2 of neighborAgents) {
                const collision = this.checkAgentCollision(agent1, agent2);
                if (collision) {
                  collisions.push(collision);
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Check collision between two agents
   */
  checkAgentCollision(agent1, agent2) {
    if (agent1.id === agent2.id) return null; // Same agent
    
    const physics1 = agent1.physics;
    const physics2 = agent2.physics;
    
    if (!physics1 || !physics2) return null;
    
    const pos1 = physics1.position;
    const pos2 = physics2.position;
    
    // Calculate distance between agents
    const distance = pos1.distanceTo(pos2);
    const collisionRadius = physics1.radius + physics2.radius;
    
    if (distance < collisionRadius) {
      // Calculate collision impact
      const impact = {
        normal: pos2.clone().subtract(pos1).normalize(),
        penetration: collisionRadius - distance,
        point: pos1.clone().add(pos2).multiplyScalar(0.5)
      };
      
      return {
        agent1,
        agent2,
        impact
      };
    }
    
    return null;
  }

  /**
   * Check collision with world bounds
   */
  checkBoundsCollision(agent, bounds) {
    const physics = agent.physics;
    if (!physics) return null;
    
    const position = physics.position;
    const radius = physics.radius;
    
    const collisions = [];
    
    // Check each axis
    if (position.x - radius < bounds.min.x) {
      collisions.push({
        type: 'bounds',
        axis: 'x',
        side: 'min',
        penetration: bounds.min.x - (position.x - radius)
      });
    } else if (position.x + radius > bounds.max.x) {
      collisions.push({
        type: 'bounds',
        axis: 'x',
        side: 'max',
        penetration: (position.x + radius) - bounds.max.x
      });
    }
    
    if (position.y - radius < bounds.min.y) {
      collisions.push({
        type: 'bounds',
        axis: 'y',
        side: 'min',
        penetration: bounds.min.y - (position.y - radius)
      });
    } else if (position.y + radius > bounds.max.y) {
      collisions.push({
        type: 'bounds',
        axis: 'y',
        side: 'max',
        penetration: (position.y + radius) - bounds.max.y
      });
    }
    
    if (position.z - radius < bounds.min.z) {
      collisions.push({
        type: 'bounds',
        axis: 'z',
        side: 'min',
        penetration: bounds.min.z - (position.z - radius)
      });
    } else if (position.z + radius > bounds.max.z) {
      collisions.push({
        type: 'bounds',
        axis: 'z',
        side: 'max',
        penetration: (position.z + radius) - bounds.max.z
      });
    }
    
    return collisions.length > 0 ? collisions : null;
  }

  /**
   * Check collision with track/network geometry
   */
  checkGeometryCollision(agent, geometry) {
    // This would be implemented based on the specific geometry type
    // For now, return null (no geometry collision)
    return null;
  }

  /**
   * Set grid size for spatial partitioning
   */
  setGridSize(size) {
    this.gridSize = size;
  }

  /**
   * Get collision detection statistics
   */
  getStats() {
    return {
      gridCells: this.spatialGrid.size,
      totalAgents: Array.from(this.spatialGrid.values()).reduce((sum, agents) => sum + agents.length, 0),
      averageAgentsPerCell: this.spatialGrid.size > 0 ? 
        Array.from(this.spatialGrid.values()).reduce((sum, agents) => sum + agents.length, 0) / this.spatialGrid.size : 0
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.spatialGrid.clear();
    this.collisionPairs.clear();
  }
}
