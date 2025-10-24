/**
 * VelocityForge Agent System
 * 
 * Manages all agents in the simulation with customizable traits,
 * AI behaviors, and real-time state updates.
 */

import { Vector3 } from '../utils/Vector3.js';
import { v4 as uuidv4 } from 'uuid';

export class AgentManager {
  constructor(maxAgents = 1000) {
    this.maxAgents = maxAgents;
    this.agents = new Map();
    this.activeAgents = new Set();
    this.agentTypes = new Map();
    
    this.stats = {
      totalAgents: 0,
      activeAgents: 0,
      averageUpdateTime: 0
    };
  }

  /**
   * Initialize agent manager with scenario agents
   */
  async initialize(agentConfigs = []) {
    console.log(`🤖 Initializing ${agentConfigs.length} agents...`);
    
    for (const config of agentConfigs) {
      await this.addAgent(config);
    }
    
    console.log(`✅ Agent manager initialized with ${this.agents.size} agents`);
  }

  /**
   * Add an agent to the simulation
   */
  async addAgent(config) {
    if (this.agents.size >= this.maxAgents) {
      console.warn(`⚠️ Maximum agent limit (${this.maxAgents}) reached`);
      return null;
    }

    const agent = new Agent(config);
    this.agents.set(agent.id, agent);
    this.activeAgents.add(agent.id);
    
    this.stats.totalAgents++;
    this.stats.activeAgents++;
    
    return agent;
  }

  /**
   * Remove an agent from the simulation
   */
  removeAgent(agentId) {
    if (!this.agents.has(agentId)) {
      return false;
    }

    const agent = this.agents.get(agentId);
    agent.destroy();
    
    this.agents.delete(agentId);
    this.activeAgents.delete(agentId);
    
    this.stats.totalAgents--;
    this.stats.activeAgents--;
    
    return true;
  }

  /**
   * Get an agent by ID
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * Get all active agents
   */
  getActiveAgents() {
    return Array.from(this.activeAgents).map(id => this.agents.get(id)).filter(Boolean);
  }

  /**
   * Get agent count
   */
  getAgentCount() {
    return this.activeAgents.size;
  }

  /**
   * Update all active agents
   */
  update(deltaTime, currentTime) {
    const startTime = performance.now();
    
    for (const agentId of this.activeAgents) {
      const agent = this.agents.get(agentId);
      if (agent && agent.isActive) {
        agent.update(deltaTime, currentTime);
      }
    }
    
    const updateTime = performance.now() - startTime;
    this.stats.averageUpdateTime = (this.stats.averageUpdateTime * 0.9) + (updateTime * 0.1);
  }

  /**
   * Register a custom agent type
   */
  registerAgentType(typeName, agentClass) {
    this.agentTypes.set(typeName, agentClass);
  }

  /**
   * Create agent of specific type
   */
  createAgentOfType(typeName, config) {
    const AgentClass = this.agentTypes.get(typeName);
    if (!AgentClass) {
      throw new Error(`Unknown agent type: ${typeName}`);
    }
    
    return new AgentClass(config);
  }

  /**
   * Get agent statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    for (const agent of this.agents.values()) {
      agent.destroy();
    }
    
    this.agents.clear();
    this.activeAgents.clear();
    this.agentTypes.clear();
  }
}

/**
 * Base Agent Class
 * 
 * Represents a single agent in the simulation with physics, AI, and state management.
 */
export class Agent {
  constructor(config = {}) {
    this.id = config.id || uuidv4();
    this.name = config.name || `Agent_${this.id.slice(0, 8)}`;
    this.type = config.type || 'generic';
    
    // Agent state
    this.isActive = true;
    this.isAlive = true;
    this.position = new Vector3(config.position?.x || 0, config.position?.y || 0, config.position?.z || 0);
    this.rotation = new Vector3(config.rotation?.x || 0, config.rotation?.y || 0, config.rotation?.z || 0);
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    
    // Physics properties
    this.physics = {
      position: this.position.clone(),
      velocity: this.velocity.clone(),
      acceleration: this.acceleration.clone(),
      mass: config.mass || 1.0,
      radius: config.radius || 0.5,
      dragCoefficient: config.dragCoefficient || 0.3,
      frictionCoefficient: config.frictionCoefficient || 0.8,
      restitution: config.restitution || 0.6,
      crossSectionalArea: config.crossSectionalArea || 1.0,
      affectedByGravity: config.affectedByGravity !== false,
      onGround: false,
      thrust: new Vector3(0, 0, 0)
    };
    
    // Agent traits
    this.traits = {
      maxSpeed: config.maxSpeed || 10.0,
      acceleration: config.acceleration || 5.0,
      turningRate: config.turningRate || 90.0, // degrees per second
      sensorRange: config.sensorRange || 10.0,
      aggression: config.aggression || 0.5, // 0-1 scale
      fuelEfficiency: config.fuelEfficiency || 0.8,
      ...config.traits
    };
    
    // AI and behavior
    this.ai = {
      enabled: config.ai !== false,
      behavior: config.behavior || 'cruise',
      target: null,
      waypoints: (config.waypoints || []).map(wp => new Vector3(wp.x, wp.y, wp.z)),
      currentWaypointIndex: 0,
      lastDecisionTime: 0,
      decisionInterval: config.decisionInterval || 0.1 // seconds
    };
    
    // Performance metrics
    this.metrics = {
      lapTime: 0,
      bestLapTime: Infinity,
      totalDistance: 0,
      collisions: 0,
      incidents: 0,
      fuelConsumed: 0,
      efficiency: 0
    };
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Initialize agent-specific setup
    this.initialize();
  }

  /**
   * Initialize agent-specific properties
   */
  initialize() {
    // Override in subclasses
  }

  /**
   * Update agent state
   */
  update(deltaTime, currentTime) {
    if (!this.isActive || !this.isAlive) return;
    
    // Update AI behavior
    if (this.ai.enabled && currentTime - this.ai.lastDecisionTime >= this.ai.decisionInterval) {
      this.updateAI(deltaTime, currentTime);
      this.ai.lastDecisionTime = currentTime;
    }
    
    // Update sensors
    this.updateSensors();
    
    // Update metrics
    this.updateMetrics(deltaTime);
  }

  /**
   * Update AI behavior
   */
  updateAI(deltaTime, currentTime) {
    switch (this.ai.behavior) {
      case 'cruise':
        this.cruiseBehavior(deltaTime);
        break;
      case 'race':
        this.raceBehavior(deltaTime);
        break;
      case 'follow':
        this.followBehavior(deltaTime);
        break;
      case 'patrol':
        this.patrolBehavior(deltaTime);
        break;
      default:
        this.cruiseBehavior(deltaTime);
    }
  }

  /**
   * Cruise behavior - basic forward movement
   */
  cruiseBehavior(deltaTime) {
    // Simple forward movement
    const forward = new Vector3(0, 0, 1);
    const thrust = forward.multiplyScalar(this.traits.acceleration);
    this.physics.thrust = thrust;
  }

  /**
   * Race behavior - competitive racing
   */
  raceBehavior(deltaTime) {
    // More aggressive racing behavior
    const forward = new Vector3(0, 0, 1);
    const thrust = forward.multiplyScalar(this.traits.acceleration * (1 + this.traits.aggression));
    this.physics.thrust = thrust;
  }

  /**
   * Follow behavior - follow a target agent
   */
  followBehavior(deltaTime) {
    if (!this.ai.target) return;
    
    const targetPosition = this.ai.target.physics.position;
    const direction = targetPosition.clone().subtract(this.physics.position).normalize();
    const thrust = direction.multiplyScalar(this.traits.acceleration);
    this.physics.thrust = thrust;
  }

  /**
   * Patrol behavior - follow waypoints
   */
  patrolBehavior(deltaTime) {
    if (this.ai.waypoints.length === 0) return;
    
    const currentWaypoint = this.ai.waypoints[this.ai.currentWaypointIndex];
    const direction = currentWaypoint.clone().subtract(this.physics.position).normalize();
    
    // Check if reached waypoint
    if (this.physics.position.distanceTo(currentWaypoint) < 1.0) {
      this.ai.currentWaypointIndex = (this.ai.currentWaypointIndex + 1) % this.ai.waypoints.length;
    }
    
    const thrust = direction.multiplyScalar(this.traits.acceleration);
    this.physics.thrust = thrust;
  }

  /**
   * Update sensors (collision detection, proximity, etc.)
   */
  updateSensors() {
    // This would be implemented based on specific sensor types
    // For now, it's a placeholder
  }

  /**
   * Update performance metrics
   */
  updateMetrics(deltaTime) {
    // Update distance traveled
    const distance = this.velocity.length() * deltaTime;
    this.metrics.totalDistance += distance;
    
    // Update fuel consumption
    const fuelConsumption = distance * (1 - this.traits.fuelEfficiency);
    this.metrics.fuelConsumed += fuelConsumption;
    
    // Update efficiency metric
    this.metrics.efficiency = this.metrics.totalDistance / Math.max(this.metrics.fuelConsumed, 0.001);
  }

  /**
   * Update agent transform
   */
  updateTransform(position, velocity, acceleration) {
    this.position.copy(position);
    this.velocity.copy(velocity);
    this.acceleration.copy(acceleration);
  }

  /**
   * Handle collision with another agent
   */
  onCollision(otherAgent, impact) {
    this.metrics.collisions++;
    
    // Emit collision event
    this.emitEvent('collision', {
      otherAgent,
      impact,
      timestamp: performance.now()
    });
  }

  /**
   * Handle incident (crash, mechanical failure, etc.)
   */
  onIncident(incidentType, severity) {
    this.metrics.incidents++;
    
    // Apply incident effects based on severity
    switch (incidentType) {
      case 'crash':
        this.handleCrash(severity);
        break;
      case 'mechanical':
        this.handleMechanicalFailure(severity);
        break;
      case 'weather':
        this.handleWeatherImpact(severity);
        break;
    }
    
    // Emit incident event
    this.emitEvent('incident', {
      type: incidentType,
      severity,
      timestamp: performance.now()
    });
  }

  /**
   * Handle crash incident
   */
  handleCrash(severity) {
    // Reduce speed based on severity
    const speedReduction = severity * 0.5;
    this.physics.velocity.multiplyScalar(1 - speedReduction);
    
    // Chance of being disabled
    if (severity > 0.8 && Math.random() < severity) {
      this.isAlive = false;
    }
  }

  /**
   * Handle mechanical failure
   */
  handleMechanicalFailure(severity) {
    // Reduce acceleration and max speed
    this.traits.acceleration *= (1 - severity * 0.3);
    this.traits.maxSpeed *= (1 - severity * 0.2);
  }

  /**
   * Handle weather impact
   */
  handleWeatherImpact(severity) {
    // Increase drag and reduce friction
    this.physics.dragCoefficient *= (1 + severity * 0.5);
    this.physics.frictionCoefficient *= (1 - severity * 0.3);
  }

  /**
   * Set AI target
   */
  setTarget(targetAgent) {
    this.ai.target = targetAgent;
  }

  /**
   * Set waypoints for patrol behavior
   */
  setWaypoints(waypoints) {
    this.ai.waypoints = waypoints.map(wp => {
      if (wp instanceof Vector3) {
        return wp.clone();
      } else {
        return new Vector3(wp.x, wp.y, wp.z);
      }
    });
    this.ai.currentWaypointIndex = 0;
  }

  /**
   * Get custom forces for physics engine
   */
  getCustomForces() {
    return []; // Override in subclasses
  }

  /**
   * Emit an event
   */
  emitEvent(eventType, data) {
    // This would be connected to the event bus
    // For now, it's a placeholder
  }

  /**
   * Get agent state for serialization
   */
  getState() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position.toObject(),
      velocity: this.velocity.toObject(),
      acceleration: this.acceleration.toObject(),
      isActive: this.isActive,
      isAlive: this.isAlive,
      metrics: { ...this.metrics },
      traits: { ...this.traits }
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.isActive = false;
    this.isAlive = false;
    this.eventHandlers.clear();
  }
}
