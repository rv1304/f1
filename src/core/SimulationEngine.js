/**
 * VelocityForge Core Simulation Engine
 * 
 * The central orchestrator that manages the simulation loop, agent coordination,
 * and real-time event processing. Designed for high-performance, low-latency
 * multi-agent scenarios.
 */

import { EventBus } from '../events/EventBus.js';
import { AgentManager } from '../agents/AgentManager.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { Leaderboard } from '../utils/Leaderboard.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';

export class SimulationEngine {
  constructor(config = {}) {
    this.config = {
      tickRate: 60,           // Hz - simulation frequency
      maxAgents: 1000,        // Maximum concurrent agents
      timeStep: 1/60,         // Fixed timestep for physics
      enablePerformanceMonitoring: true,
      enableRealTimeEvents: true,
      ...config
    };

    // Core systems
    this.eventBus = new EventBus();
    this.agentManager = new AgentManager(this.config.maxAgents);
    this.physicsEngine = new PhysicsEngine(this.config.timeStep);
    this.leaderboard = new Leaderboard();
    this.performanceMonitor = new PerformanceMonitor();

    // Simulation state
    this.isRunning = false;
    this.currentTime = 0;
    this.tickCount = 0;
    this.lastTickTime = 0;
    this.deltaTime = 0;

    // Performance tracking
    this.stats = {
      agentsActive: 0,
      eventsProcessed: 0,
      physicsUpdates: 0,
      averageTickTime: 0,
      fps: 0
    };

    this.setupEventHandlers();
  }

  /**
   * Initialize the simulation with a scenario
   */
  async initialize(scenario) {
    console.log('🚀 Initializing VelocityForge simulation...');
    
    try {
      // Load scenario (track, network, etc.)
      await this.loadScenario(scenario);
      
      // Initialize physics engine with scenario bounds
      this.physicsEngine.initialize(scenario.bounds);
      
      // Setup agents based on scenario
      await this.agentManager.initialize(scenario.agents);
      
      // Start performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.performanceMonitor.start();
      }

      console.log(`✅ Simulation initialized with ${this.agentManager.getAgentCount()} agents`);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize simulation:', error);
      return false;
    }
  }

  /**
   * Start the simulation loop
   */
  start() {
    if (this.isRunning) {
      console.warn('⚠️ Simulation is already running');
      return;
    }

    console.log('🏁 Starting simulation...');
    this.isRunning = true;
    this.lastTickTime = performance.now();
    
    // Start the main simulation loop
    this.simulationLoop();
    
    // Emit simulation started event
    this.eventBus.emit('simulation:started', {
      timestamp: this.currentTime,
      agentCount: this.agentManager.getAgentCount()
    });
  }

  /**
   * Stop the simulation
   */
  stop() {
    if (!this.isRunning) {
      console.warn('⚠️ Simulation is not running');
      return;
    }

    console.log('🏁 Stopping simulation...');
    this.isRunning = false;
    
    // Emit simulation stopped event
    this.eventBus.emit('simulation:stopped', {
      timestamp: this.currentTime,
      finalStats: this.getStats()
    });
  }

  /**
   * Main simulation loop - optimized for high performance
   */
  simulationLoop() {
    if (!this.isRunning) return;

    const now = performance.now();
    this.deltaTime = (now - this.lastTickTime) / 1000; // Convert to seconds
    this.lastTickTime = now;

    // Fixed timestep physics update
    this.updatePhysics();
    
    // Process events
    this.processEvents();
    
    // Update agents
    this.updateAgents();
    
    // Update leaderboard
    this.updateLeaderboard();
    
    // Update performance stats
    this.updateStats();
    
    // Increment simulation time
    this.currentTime += this.config.timeStep;
    this.tickCount++;

    // Schedule next frame
    const targetFrameTime = 1000 / this.config.tickRate;
    const elapsed = performance.now() - now;
    const delay = Math.max(0, targetFrameTime - elapsed);
    
    setTimeout(() => this.simulationLoop(), delay);
  }

  /**
   * Update physics for all agents
   */
  updatePhysics() {
    const startTime = performance.now();
    
    const agents = this.agentManager.getActiveAgents();
    this.physicsEngine.update(agents, this.deltaTime);
    
    this.stats.physicsUpdates++;
    
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.recordPhysicsUpdate(performance.now() - startTime);
    }
  }

  /**
   * Process all pending events
   */
  processEvents() {
    const startTime = performance.now();
    
    const events = this.eventBus.processEvents();
    this.stats.eventsProcessed += events.length;
    
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.recordEventProcessing(performance.now() - startTime);
    }
  }

  /**
   * Update all agents (AI, sensors, etc.)
   */
  updateAgents() {
    const startTime = performance.now();
    
    this.agentManager.update(this.deltaTime, this.currentTime);
    this.stats.agentsActive = this.agentManager.getAgentCount();
    
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.recordAgentUpdate(performance.now() - startTime);
    }
  }

  /**
   * Update the leaderboard with current standings
   */
  updateLeaderboard() {
    const agents = this.agentManager.getActiveAgents();
    this.leaderboard.update(agents, this.currentTime);
  }

  /**
   * Update performance statistics
   */
  updateStats() {
    const now = performance.now();
    const tickTime = now - this.lastTickTime;
    
    // Calculate rolling average FPS
    this.stats.averageTickTime = (this.stats.averageTickTime * 0.9) + (tickTime * 0.1);
    this.stats.fps = 1000 / this.stats.averageTickTime;
  }

  /**
   * Load a scenario configuration
   */
  async loadScenario(scenario) {
    // This will be implemented in the scenario system
    console.log(`📋 Loading scenario: ${scenario.name}`);
    this.currentScenario = scenario;
  }

  /**
   * Setup event handlers for simulation events
   */
  setupEventHandlers() {
    // Agent events
    this.eventBus.on('agent:collision', (data) => {
      this.handleAgentCollision(data);
    });

    this.eventBus.on('agent:lapComplete', (data) => {
      this.handleLapComplete(data);
    });

    this.eventBus.on('agent:incident', (data) => {
      this.handleAgentIncident(data);
    });

    // System events
    this.eventBus.on('system:performanceWarning', (data) => {
      console.warn('⚠️ Performance warning:', data);
    });
  }

  /**
   * Handle agent collision events
   */
  handleAgentCollision(data) {
    const { agent1, agent2, impact } = data;
    
    // Apply collision physics
    this.physicsEngine.resolveCollision(agent1, agent2, impact);
    
    // Update agent states
    agent1.onCollision(agent2, impact);
    agent2.onCollision(agent1, impact);
    
    // Emit collision event for external systems
    this.eventBus.emit('simulation:collision', data);
  }

  /**
   * Handle lap completion events
   */
  handleLapComplete(data) {
    const { agent, lapTime, position } = data;
    
    // Update leaderboard
    this.leaderboard.recordLapTime(agent.id, lapTime, position);
    
    // Emit lap complete event
    this.eventBus.emit('simulation:lapComplete', data);
  }

  /**
   * Handle agent incidents (crashes, mechanical failures, etc.)
   */
  handleAgentIncident(data) {
    const { agent, incidentType, severity } = data;
    
    // Apply incident effects
    agent.onIncident(incidentType, severity);
    
    // Emit incident event
    this.eventBus.emit('simulation:incident', data);
  }

  /**
   * Get current simulation statistics
   */
  getStats() {
    return {
      ...this.stats,
      currentTime: this.currentTime,
      tickCount: this.tickCount,
      isRunning: this.isRunning,
      performance: this.performanceMonitor.getStats()
    };
  }

  /**
   * Get the current leaderboard
   */
  getLeaderboard() {
    return this.leaderboard.getCurrentStandings();
  }

  /**
   * Add an agent to the simulation
   */
  addAgent(agentConfig) {
    return this.agentManager.addAgent(agentConfig);
  }

  /**
   * Remove an agent from the simulation
   */
  removeAgent(agentId) {
    return this.agentManager.removeAgent(agentId);
  }

  /**
   * Get all active agents
   */
  getAgents() {
    return this.agentManager.getActiveAgents();
  }

  /**
   * Emit a custom event
   */
  emitEvent(eventType, data) {
    this.eventBus.emit(eventType, data);
  }

  /**
   * Subscribe to simulation events
   */
  onEvent(eventType, callback) {
    this.eventBus.on(eventType, callback);
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stop();
    this.eventBus.destroy();
    this.agentManager.destroy();
    this.physicsEngine.destroy();
    this.performanceMonitor.stop();
  }
}
