/**
 * VelocityForge Main Entry Point
 * 
 * The main entry point for the VelocityForge simulation engine.
 * Provides a simple API for creating and running simulations.
 */

import { SimulationEngine } from './core/SimulationEngine.js';
import { createDemoScenario } from './scenarios/DemoScenario.js';
import { ConsoleDashboard } from './utils/ConsoleDashboard.js';
import { F1GrandPrixScenario } from './scenarios/F1GrandPrixScenario.js';

class VelocityForge {
  constructor() {
    this.simulation = null;
    this.isInitialized = false;
    this.dashboard = null;
    this.maxRuntime = 30; // Default 30 seconds
    this.f1GrandPrix = null;
  }

  /**
   * Initialize VelocityForge
   */
  async initialize(config = {}) {
    console.log('🚀 Initializing VelocityForge...');
    
    try {
      this.simulation = new SimulationEngine(config);
      this.isInitialized = true;
      
      console.log('✅ VelocityForge initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize VelocityForge:', error);
      return false;
    }
  }

  /**
   * Load a scenario
   */
  async loadScenario(scenario) {
    if (!this.isInitialized) {
      throw new Error('VelocityForge not initialized. Call initialize() first.');
    }

    return await this.simulation.initialize(scenario);
  }

  /**
   * Start the simulation
   */
  start() {
    if (!this.isInitialized) {
      throw new Error('VelocityForge not initialized. Call initialize() first.');
    }

    this.simulation.start();
  }

  /**
   * Stop the simulation
   */
  stop() {
    if (!this.isInitialized) {
      throw new Error('VelocityForge not initialized. Call initialize() first.');
    }

    this.simulation.stop();
    
    // Stop dashboard
    if (this.dashboard) {
      this.dashboard.stop();
    }
  }

  /**
   * Get simulation statistics
   */
  getStats() {
    if (!this.isInitialized) {
      throw new Error('VelocityForge not initialized. Call initialize() first.');
    }

    return this.simulation.getStats();
  }

  /**
   * Get current leaderboard
   */
  getLeaderboard() {
    if (!this.isInitialized) {
      throw new Error('VelocityForge not initialized. Call initialize() first.');
    }

    return this.simulation.getLeaderboard();
  }

  /**
   * Add an agent to the simulation
   */
  addAgent(agentConfig) {
    if (!this.isInitialized) {
      throw new Error('VelocityForge not initialized. Call initialize() first.');
    }

    return this.simulation.addAgent(agentConfig);
  }

  /**
   * Remove an agent from the simulation
   */
  removeAgent(agentId) {
    if (!this.isInitialized) {
      throw new Error('VelocityForge not initialized. Call initialize() first.');
    }

    return this.simulation.removeAgent(agentId);
  }

  /**
   * Get all agents
   */
  getAgents() {
    if (!this.isInitialized) {
      throw new Error('VelocityForge not initialized. Call initialize() first.');
    }

    return this.simulation.getAgents();
  }

  /**
   * Subscribe to simulation events
   */
  onEvent(eventType, callback) {
    if (!this.isInitialized) {
      throw new Error('VelocityForge not initialized. Call initialize() first.');
    }

    this.simulation.onEvent(eventType, callback);
  }

  /**
   * Emit a custom event
   */
  emitEvent(eventType, data) {
    if (!this.isInitialized) {
      throw new Error('VelocityForge not initialized. Call initialize() first.');
    }

    this.simulation.emitEvent(eventType, data);
  }

  /**
   * Run a demo simulation
   */
  async runDemo(maxRuntime = 30) {
    console.log('🎮 Running VelocityForge demo...');
    
    // Initialize if not already done
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Load demo scenario
    const demoScenario = createDemoScenario();
    await this.loadScenario(demoScenario);
    
    // Create and start console dashboard
    this.dashboard = new ConsoleDashboard(this.simulation);
    this.dashboard.start();
    
    // Start simulation
    this.start();
    
    // Set up event listeners for demo
    this.setupDemoEventListeners();
    
    // Set up auto-stop timer
    setTimeout(() => {
      console.log('\n⏰ Demo time limit reached. Stopping simulation...');
      this.stop();
    }, maxRuntime * 1000);
    
    console.log(`🏁 Demo simulation started! Will run for ${maxRuntime} seconds.`);
    return true;
  }

  /**
   * Run F1 Grand Prix simulation
   */
  async runF1GrandPrix(config = {}) {
    console.log('🏎️ Starting F1 Grand Prix simulation...');
    
    try {
      // Create F1 Grand Prix scenario
      this.f1GrandPrix = new F1GrandPrixScenario();
      
      // Initialize with configuration
      await this.f1GrandPrix.initialize(config);
      
      // Start the race
      this.f1GrandPrix.start();
      
      console.log('🏁 F1 Grand Prix started!');
      return true;
    } catch (error) {
      console.error('❌ Failed to start F1 Grand Prix:', error);
      return false;
    }
  }

  /**
   * Setup demo event listeners
   */
  setupDemoEventListeners() {
    // Listen for simulation events
    this.onEvent('simulation:started', (data) => {
      if (this.dashboard) {
        this.dashboard.onSimulationEvent('simulation:started', data);
      }
    });

    this.onEvent('simulation:stopped', (data) => {
      if (this.dashboard) {
        this.dashboard.onSimulationEvent('simulation:stopped', data);
      }
    });

    this.onEvent('simulation:collision', (data) => {
      if (this.dashboard) {
        this.dashboard.onSimulationEvent('simulation:collision', data);
      }
    });

    this.onEvent('simulation:lapComplete', (data) => {
      if (this.dashboard) {
        this.dashboard.onSimulationEvent('simulation:lapComplete', data);
      }
    });

    this.onEvent('simulation:incident', (data) => {
      if (this.dashboard) {
        this.dashboard.onSimulationEvent('simulation:incident', data);
      }
    });
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.dashboard) {
      this.dashboard.stop();
      this.dashboard = null;
    }
    
    if (this.simulation) {
      this.simulation.destroy();
      this.simulation = null;
    }
    
    this.isInitialized = false;
  }
}

// Create global instance
const velocityForge = new VelocityForge();

// Export for use in other modules
export { VelocityForge, velocityForge };

// If running directly, start demo
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎮 Starting VelocityForge demo...');
  
  // Get runtime from command line args or use default
  const runtime = process.argv[2] ? parseInt(process.argv[2]) : 30;
  
  velocityForge.runDemo(runtime).then(() => {
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down VelocityForge...');
      velocityForge.destroy();
      process.exit(0);
    });
    
    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('\n🛑 Terminating VelocityForge...');
      velocityForge.destroy();
      process.exit(0);
    });
  }).catch(error => {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  });
}
