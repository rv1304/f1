/**
 * Competitive Mobility Systems Simulator - Core Simulation Engine
 * Real-time multi-agent racing with physics, events, and collision detection
 * 
 * Features:
 * - 10Hz tick rate simulation
 * - Agent physics (position, speed, acceleration)
 * - Overtake detection
 * - Collision system
 * - Event emission for WebSocket broadcast
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export class SimulationEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Race configuration
    this.trackLength = config.trackLength || 5000; // meters
    this.totalLaps = config.totalLaps || 3;
    this.tickRate = config.tickRate || 10; // Hz
    this.collisionDistance = config.collisionDistance || 50; // meters
    this.collisionSpeedThreshold = config.collisionSpeedThreshold || 5; // m/s
    
    // Simulation state
    this.agents = new Map();
    this.previousOrder = [];
    this.currentOrder = [];
    this.sequenceNumber = 0;
    this.raceStartTime = null;
    this.raceStatus = 'waiting'; // waiting, running, finished
    this.events = [];
    
    // Performance tracking
    this.tickCount = 0;
    this.lastPerformanceCheck = Date.now();
    
    this.setupTickLoop();
  }

  /**
   * Add a new agent to the simulation
   */
  addAgent(agentData) {
    const agent = {
      id: agentData.id || uuidv4(),
      name: agentData.name || `Agent-${this.agents.size + 1}`,
      avatarUrl: agentData.avatarUrl || null,
      
      // Physics properties
      position: 0, // distance along track in meters
      lap: 0,
      speed: 0, // m/s
      acceleration: agentData.acceleration || 0.5, // m/s²
      maxSpeed: agentData.maxSpeed || (45 + Math.random() * 15), // 45-60 m/s (160-216 km/h)
      handling: agentData.handling || (0.7 + Math.random() * 0.3), // 0.7-1.0
      fuel: 100,
      
      // State
      status: 'ready', // ready, running, crashed, pit, finished
      
      // Stats tracking
      bestLapTime: null,
      totalTime: 0,
      lapStartTime: null,
      overtakes: 0,
      collisions: 0,
      
      // AI behavior (for demo)
      aiPersonality: agentData.aiPersonality || this.generateAIPersonality()
    };

    this.agents.set(agent.id, agent);
    this.emit('agent_added', { agent: this.sanitizeAgent(agent) });
    
    return agent.id;
  }

  /**
   * Remove agent from simulation
   */
  removeAgent(agentId) {
    if (this.agents.has(agentId)) {
      this.agents.delete(agentId);
      this.emit('agent_removed', { agentId });
    }
  }

  /**
   * Start the race simulation
   */
  startRace() {
    if (this.raceStatus !== 'waiting') {
      throw new Error('Race is not in waiting state');
    }

    this.raceStatus = 'running';
    this.raceStartTime = Date.now();
    
    // Initialize all agents
    for (const agent of this.agents.values()) {
      agent.status = 'running';
      agent.lapStartTime = this.raceStartTime;
    }

    this.emit('race_started', {
      timestamp: new Date().toISOString(),
      totalAgents: this.agents.size
    });
  }

  /**
   * Pause/resume race
   */
  pauseRace() {
    this.raceStatus = this.raceStatus === 'running' ? 'paused' : 'running';
    this.emit('race_paused', { status: this.raceStatus });
  }

  /**
   * Reset race to initial state
   */
  resetRace() {
    this.raceStatus = 'waiting';
    this.sequenceNumber = 0;
    this.events = [];
    this.raceStartTime = null;
    
    for (const agent of this.agents.values()) {
      agent.position = 0;
      agent.lap = 0;
      agent.speed = 0;
      agent.status = 'ready';
      agent.fuel = 100;
      agent.bestLapTime = null;
      agent.totalTime = 0;
      agent.lapStartTime = null;
      agent.overtakes = 0;
      agent.collisions = 0;
    }

    this.emit('race_reset', { timestamp: new Date().toISOString() });
  }

  /**
   * Handle agent control commands
   */
  controlAgent(agentId, action, params = {}) {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    switch (action) {
      case 'boost':
        if (agent.fuel > 10) {
          agent.speed = Math.min(agent.maxSpeed * 1.3, agent.speed * 1.5);
          agent.fuel -= 10;
          this.addEvent('boost_used', { agentId, fuelRemaining: agent.fuel });
        }
        break;
        
      case 'pit':
        if (agent.status === 'running') {
          agent.status = 'pit';
          agent.speed = 0;
          setTimeout(() => {
            if (agent.status === 'pit') {
              agent.fuel = 100;
              agent.status = 'running';
              this.addEvent('pit_complete', { agentId });
            }
          }, 3000); // 3 second pit stop
          this.addEvent('pit_stop', { agentId });
        }
        break;
        
      case 'crash':
        agent.status = 'crashed';
        agent.speed = 0;
        agent.collisions++;
        this.addEvent('crash', { agentId });
        break;
    }

    return true;
  }

  /**
   * Core simulation tick - runs at specified Hz
   */
  setupTickLoop() {
    const tickInterval = 1000 / this.tickRate;
    
    setInterval(() => {
      if (this.raceStatus === 'running') {
        this.tick();
      }
    }, tickInterval);
  }

  /**
   * Single simulation tick
   */
  tick() {
    const dt = 1 / this.tickRate; // delta time in seconds
    const currentTime = Date.now();
    
    // Update each agent
    for (const agent of this.agents.values()) {
      this.updateAgent(agent, dt, currentTime);
    }
    
    // Detect events
    this.detectOvertakes();
    this.detectCollisions();
    
    // Check race completion
    this.checkRaceCompletion();
    
    // Update leaderboard order
    this.updateLeaderboard();
    
    // Emit state update
    this.broadcastState();
    
    // Performance tracking
    this.tickCount++;
    if (currentTime - this.lastPerformanceCheck > 5000) {
      this.checkPerformance(currentTime);
    }
  }

  /**
   * Update individual agent physics and AI
   */
  updateAgent(agent, dt, currentTime) {
    if (agent.status !== 'running') return;

    // AI decision making (simple behavior tree)
    this.updateAgentAI(agent, dt);
    
    // Physics update
    agent.speed = Math.max(0, Math.min(agent.maxSpeed, 
      agent.speed + agent.acceleration * dt
    ));
    
    // Position update
    const oldPosition = agent.position;
    agent.position += agent.speed * dt;
    
    // Lap completion check
    if (agent.position >= this.trackLength) {
      agent.position -= this.trackLength;
      agent.lap++;
      
      // Calculate lap time
      if (agent.lapStartTime) {
        const lapTime = currentTime - agent.lapStartTime;
        if (!agent.bestLapTime || lapTime < agent.bestLapTime) {
          agent.bestLapTime = lapTime;
        }
        agent.totalTime += lapTime;
        
        this.addEvent('lap_complete', {
          agentId: agent.id,
          lap: agent.lap,
          lapTime,
          bestLap: lapTime === agent.bestLapTime
        });
      }
      
      agent.lapStartTime = currentTime;
      
      // Check if finished
      if (agent.lap >= this.totalLaps) {
        agent.status = 'finished';
        this.addEvent('agent_finished', {
          agentId: agent.id,
          finalPosition: this.calculatePosition(agent),
          totalTime: agent.totalTime
        });
      }
    }
    
    // Fuel consumption
    agent.fuel = Math.max(0, agent.fuel - (agent.speed / agent.maxSpeed) * 0.01);
    if (agent.fuel === 0) {
      agent.speed *= 0.5; // Reduced speed on empty fuel
    }
  }

  /**
   * Simple AI behavior for demo agents
   */
  updateAgentAI(agent, dt) {
    const personality = agent.aiPersonality;
    
    // Base acceleration with personality variation
    agent.acceleration = personality.baseAcceleration + 
      (Math.random() - 0.5) * personality.aggression * 0.2;
    
    // Random events based on personality
    if (Math.random() < personality.riskTaking * 0.001) {
      // Attempt boost if fuel available
      if (agent.fuel > 20) {
        this.controlAgent(agent.id, 'boost');
      }
    }
    
    if (Math.random() < personality.pitStrategy * 0.0005 && agent.fuel < 30) {
      // Strategic pit stop
      this.controlAgent(agent.id, 'pit');
    }
  }

  /**
   * Detect overtaking events
   */
  detectOvertakes() {
    const newOrder = this.getLeaderboardOrder();
    
    // Compare with previous order to detect position changes
    for (let i = 0; i < newOrder.length; i++) {
      const currentAgent = newOrder[i];
      const previousIndex = this.previousOrder.findIndex(id => id === currentAgent);
      
      if (previousIndex > i && previousIndex !== -1) {
        // Agent moved up in position - overtake!
        const overtakenAgents = this.previousOrder.slice(i, previousIndex);
        
        overtakenAgents.forEach(overtakenId => {
          const overtaker = this.agents.get(currentAgent);
          const overtaken = this.agents.get(overtakenId);
          
          if (overtaker && overtaken) {
            overtaker.overtakes++;
            
            this.addEvent('overtake', {
              overtaker: {
                id: overtaker.id,
                name: overtaker.name
              },
              overtaken: {
                id: overtaken.id,
                name: overtaken.name
              },
              position: i + 1
            });
          }
        });
      }
    }
    
    this.previousOrder = newOrder;
  }

  /**
   * Detect collision events
   */
  detectCollisions() {
    const runningAgents = Array.from(this.agents.values())
      .filter(a => a.status === 'running');
    
    for (let i = 0; i < runningAgents.length; i++) {
      for (let j = i + 1; j < runningAgents.length; j++) {
        const agentA = runningAgents[i];
        const agentB = runningAgents[j];
        
        // Check if agents are on same lap and close enough
        if (agentA.lap === agentB.lap) {
          const distance = Math.abs(agentA.position - agentB.position);
          const relativeSpeed = Math.abs(agentA.speed - agentB.speed);
          
          if (distance < this.collisionDistance && relativeSpeed > this.collisionSpeedThreshold) {
            // Collision detected!
            this.handleCollision(agentA, agentB);
          }
        }
      }
    }
  }

  /**
   * Handle collision between two agents
   */
  handleCollision(agentA, agentB) {
    // Reduce speed for both agents
    agentA.speed *= 0.3;
    agentB.speed *= 0.3;
    
    // Mark collision count
    agentA.collisions++;
    agentB.collisions++;
    
    this.addEvent('collision', {
      agents: [
        { id: agentA.id, name: agentA.name },
        { id: agentB.id, name: agentB.name }
      ],
      location: (agentA.position + agentB.position) / 2,
      lap: agentA.lap
    });
  }

  /**
   * Check if race should be completed
   */
  checkRaceCompletion() {
    const finishedAgents = Array.from(this.agents.values())
      .filter(a => a.status === 'finished');
    
    const runningAgents = Array.from(this.agents.values())
      .filter(a => a.status === 'running');
    
    // Race is finished if all agents finished or only 1 running agent remains
    if (finishedAgents.length === this.agents.size || 
        (finishedAgents.length > 0 && runningAgents.length <= 1)) {
      this.finishRace();
    }
  }

  /**
   * Finish the race and calculate final results
   */
  finishRace() {
    if (this.raceStatus === 'finished') return;
    
    this.raceStatus = 'finished';
    
    const results = this.getFinalResults();
    
    this.emit('race_finished', {
      timestamp: new Date().toISOString(),
      results,
      raceStatistics: this.getRaceStatistics()
    });
  }

  /**
   * Update leaderboard order
   */
  updateLeaderboard() {
    this.currentOrder = this.getLeaderboardOrder();
  }

  /**
   * Get current leaderboard order
   */
  getLeaderboardOrder() {
    return Array.from(this.agents.values())
      .sort((a, b) => {
        // Sort by lap (desc), then by position (desc)
        if (a.lap !== b.lap) return b.lap - a.lap;
        return b.position - a.position;
      })
      .map(agent => agent.id);
  }

  /**
   * Calculate agent's current position in race
   */
  calculatePosition(agent) {
    const order = this.getLeaderboardOrder();
    return order.indexOf(agent.id) + 1;
  }

  /**
   * Add event to the event log
   */
  addEvent(type, data) {
    const event = {
      id: uuidv4(),
      type,
      timestamp: new Date().toISOString(),
      sequenceNumber: this.sequenceNumber++,
      ...data
    };
    
    this.events.push(event);
    
    // Keep only last 1000 events for memory management
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    this.emit('race_event', { event });
  }

  /**
   * Broadcast current simulation state
   */
  broadcastState() {
    const state = {
      sequenceNumber: this.sequenceNumber++,
      timestamp: new Date().toISOString(),
      raceStatus: this.raceStatus,
      agents: Array.from(this.agents.values()).map(agent => this.sanitizeAgent(agent)),
      leaderboard: this.currentOrder,
      raceTime: this.raceStartTime ? Date.now() - this.raceStartTime : 0
    };
    
    this.emit('race_state', { state });
  }

  /**
   * Generate AI personality for demo agents
   */
  generateAIPersonality() {
    return {
      baseAcceleration: 0.3 + Math.random() * 0.4, // 0.3-0.7 m/s²
      aggression: Math.random(), // 0-1
      riskTaking: Math.random(), // 0-1
      pitStrategy: Math.random(), // 0-1
      consistency: 0.5 + Math.random() * 0.5 // 0.5-1
    };
  }

  /**
   * Sanitize agent data for client broadcast
   */
  sanitizeAgent(agent) {
    return {
      id: agent.id,
      name: agent.name,
      avatarUrl: agent.avatarUrl,
      position: Math.round(agent.position * 100) / 100,
      lap: agent.lap,
      speed: Math.round(agent.speed * 100) / 100,
      fuel: Math.round(agent.fuel * 10) / 10,
      status: agent.status,
      bestLapTime: agent.bestLapTime,
      totalTime: agent.totalTime,
      overtakes: agent.overtakes,
      collisions: agent.collisions
    };
  }

  /**
   * Get final race results
   */
  getFinalResults() {
    return Array.from(this.agents.values())
      .sort((a, b) => {
        if (a.status === 'finished' && b.status !== 'finished') return -1;
        if (b.status === 'finished' && a.status !== 'finished') return 1;
        if (a.lap !== b.lap) return b.lap - a.lap;
        return b.position - a.position;
      })
      .map((agent, index) => ({
        position: index + 1,
        agent: this.sanitizeAgent(agent),
        finalTime: agent.totalTime,
        bestLapTime: agent.bestLapTime,
        averageSpeed: agent.totalTime > 0 ? 
          (agent.lap * this.trackLength) / (agent.totalTime / 1000) : 0
      }));
  }

  /**
   * Get race statistics
   */
  getRaceStatistics() {
    const agents = Array.from(this.agents.values());
    const totalEvents = this.events.length;
    const overtakeEvents = this.events.filter(e => e.type === 'overtake').length;
    const collisionEvents = this.events.filter(e => e.type === 'collision').length;
    
    return {
      totalAgents: agents.length,
      totalEvents,
      overtakeEvents,
      collisionEvents,
      raceDuration: this.raceStartTime ? Date.now() - this.raceStartTime : 0,
      averageSpeed: agents.reduce((sum, a) => sum + a.speed, 0) / agents.length
    };
  }

  /**
   * Performance monitoring
   */
  checkPerformance(currentTime) {
    const duration = currentTime - this.lastPerformanceCheck;
    const ticksPerSecond = (this.tickCount * 1000) / duration;
    
    this.emit('performance_update', {
      ticksPerSecond: Math.round(ticksPerSecond * 100) / 100,
      targetTickRate: this.tickRate,
      agentCount: this.agents.size,
      eventCount: this.events.length
    });
    
    this.tickCount = 0;
    this.lastPerformanceCheck = currentTime;
  }

  /**
   * Get current simulation state
   */
  getState() {
    return {
      raceStatus: this.raceStatus,
      agents: Array.from(this.agents.values()).map(agent => this.sanitizeAgent(agent)),
      leaderboard: this.currentOrder,
      events: this.events.slice(-50), // Last 50 events
      raceTime: this.raceStartTime ? Date.now() - this.raceStartTime : 0,
      config: {
        trackLength: this.trackLength,
        totalLaps: this.totalLaps,
        tickRate: this.tickRate
      }
    };
  }
}