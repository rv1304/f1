/**
 * VelocityForge - Competitive Mobility Systems Simulator
 * 
 * A lightweight, real-time simulator for multiple mobility scenarios:
 * - Formula E, MotoGP, drones, supply-chain races, traffic flow
 * - Moving agents with real-time leaderboard
 * - Event-driven system with incidents and changes
 * - Visual console dashboard
 */

import { EventEmitter } from 'events';

class CompetitiveMobilitySimulator extends EventEmitter {
  constructor() {
    super();
    
    this.isRunning = false;
    this.agents = [];
    this.events = [];
    this.leaderboard = [];
    this.scenario = null;
    this.updateInterval = null;
    
    // Simulation state
    this.state = {
      time: 0,
      lap: 0,
      totalDistance: 0,
      incidents: 0,
      weather: 'clear',
      temperature: 25
    };
    
    // Performance tracking
    this.stats = {
      fps: 0,
      lastUpdate: 0,
      frameCount: 0,
      startTime: Date.now()
    };
  }

  /**
   * Initialize the simulator
   */
  initialize(scenarioType = 'f1') {
    console.log('🏎️ Initializing Competitive Mobility Simulator...');
    
    this.scenario = this.createScenario(scenarioType);
    this.createAgents();
    this.setupEventSystem();
    
    console.log(`✅ Simulator initialized with ${this.agents.length} agents`);
    return true;
  }

  /**
   * Create scenario based on type
   */
  createScenario(type) {
    const scenarios = {
      f1: {
        name: 'Formula 1 Grand Prix',
        trackLength: 5.3, // km
        maxLaps: 78,
        agentCount: 20,
        icon: '🏎️'
      },
      formulaE: {
        name: 'Formula E Championship',
        trackLength: 2.5, // km
        maxLaps: 45,
        agentCount: 22,
        icon: '⚡'
      },
      motogp: {
        name: 'MotoGP Race',
        trackLength: 4.2, // km
        maxLaps: 28,
        agentCount: 24,
        icon: '🏍️'
      },
      drones: {
        name: 'Drone Racing Championship',
        trackLength: 0.8, // km
        maxLaps: 15,
        agentCount: 16,
        icon: '🚁'
      },
      supplyChain: {
        name: 'Supply Chain Race',
        trackLength: 12.0, // km
        maxLaps: 5,
        agentCount: 12,
        icon: '🚛'
      },
      traffic: {
        name: 'Traffic Flow Management',
        trackLength: 8.0, // km
        maxLaps: 3,
        agentCount: 50,
        icon: '🚗'
      }
    };
    
    return scenarios[type] || scenarios.f1;
  }

  /**
   * Create agents for the scenario
   */
  createAgents() {
    this.agents = [];
    
    for (let i = 0; i < this.scenario.agentCount; i++) {
      const agent = {
        id: i + 1,
        name: this.generateAgentName(i),
        type: this.scenario.icon,
        position: 0, // km
        speed: 0, // km/h
        maxSpeed: 180 + Math.random() * 40, // km/h
        acceleration: 0.8 + Math.random() * 0.4,
        lap: 0,
        totalTime: 0,
        bestLapTime: Infinity,
        currentLapTime: 0,
        status: 'racing',
        fuel: 100,
        tireWear: 0,
        incidents: 0,
        overtakes: 0,
        pitStops: 0,
        color: this.getAgentColor(i)
      };
      
      this.agents.push(agent);
    }
    
    // Sort by starting position
    this.agents.sort((a, b) => a.id - b.id);
  }

  /**
   * Generate agent name
   */
  generateAgentName(index) {
    const names = [
      'Speed Demon', 'Lightning Bolt', 'Thunder Strike', 'Velocity King',
      'Racing Star', 'Track Master', 'Speed Racer', 'Fast Lane',
      'Turbo Boost', 'Nitro Rush', 'Velocity Max', 'Speed Force',
      'Racing Pro', 'Track Legend', 'Speed Machine', 'Velocity Ace',
      'Racing Hero', 'Track Warrior', 'Speed Champion', 'Velocity Pro',
      'Racing Ace', 'Track Master', 'Speed King', 'Velocity Star',
      'Racing Legend', 'Track Hero', 'Speed Master', 'Velocity King',
      'Racing Star', 'Track Ace', 'Speed Pro', 'Velocity Master'
    ];
    
    return names[index] || `Agent ${index + 1}`;
  }

  /**
   * Get agent color for display
   */
  getAgentColor(index) {
    const colors = [
      '🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚫', '⚪',
      '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💎'
    ];
    
    return colors[index % colors.length];
  }

  /**
   * Setup event system
   */
  setupEventSystem() {
    this.events = [];
    
    // Schedule random events
    this.scheduleEvent('weather_change', 30000); // 30 seconds
    this.scheduleEvent('incident', 45000); // 45 seconds
    this.scheduleEvent('overtake', 15000); // 15 seconds
    this.scheduleEvent('pit_stop', 60000); // 60 seconds
  }

  /**
   * Schedule an event
   */
  scheduleEvent(type, delay) {
    setTimeout(() => {
      if (this.isRunning) {
        this.triggerEvent(type);
        this.scheduleEvent(type, delay + Math.random() * 10000);
      }
    }, delay);
  }

  /**
   * Trigger an event
   */
  triggerEvent(type) {
    const event = {
      type,
      time: this.state.time,
      description: this.getEventDescription(type),
      agent: null
    };
    
    switch (type) {
      case 'weather_change':
        this.changeWeather();
        event.description = `Weather changed to ${this.state.weather}`;
        break;
        
      case 'incident':
        const incidentAgent = this.agents[Math.floor(Math.random() * this.agents.length)];
        incidentAgent.incidents++;
        incidentAgent.speed *= 0.7; // Slow down
        event.agent = incidentAgent.name;
        this.state.incidents++;
        break;
        
      case 'overtake':
        const overtakingAgent = this.agents[Math.floor(Math.random() * this.agents.length)];
        overtakingAgent.overtakes++;
        event.agent = overtakingAgent.name;
        break;
        
      case 'pit_stop':
        const pitAgent = this.agents[Math.floor(Math.random() * this.agents.length)];
        pitAgent.pitStops++;
        pitAgent.fuel = 100;
        pitAgent.tireWear = 0;
        event.agent = pitAgent.name;
        break;
    }
    
    this.events.push(event);
    this.emit('event', event);
  }

  /**
   * Get event description
   */
  getEventDescription(type) {
    const descriptions = {
      weather_change: 'Weather conditions changed',
      incident: 'Incident occurred',
      overtake: 'Overtaking maneuver',
      pit_stop: 'Pit stop completed'
    };
    
    return descriptions[type] || 'Unknown event';
  }

  /**
   * Change weather
   */
  changeWeather() {
    const weathers = ['clear', 'cloudy', 'rain', 'storm'];
    this.state.weather = weathers[Math.floor(Math.random() * weathers.length)];
    
    // Adjust temperature based on weather
    switch (this.state.weather) {
      case 'rain':
        this.state.temperature = 15 + Math.random() * 10;
        break;
      case 'storm':
        this.state.temperature = 10 + Math.random() * 8;
        break;
      default:
        this.state.temperature = 20 + Math.random() * 15;
    }
  }

  /**
   * Start the simulation
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Simulation is already running');
      return;
    }
    
    console.log('🏁 Starting Competitive Mobility Simulation...');
    this.isRunning = true;
    this.stats.startTime = Date.now();
    
    // Start simulation loop
    this.updateInterval = setInterval(() => {
      this.update();
    }, 100); // 10 FPS
    
    // Display initial state
    this.displayDashboard();
    
    console.log('✅ Simulation started successfully');
  }

  /**
   * Update simulation
   */
  update() {
    const now = Date.now();
    const deltaTime = (now - this.stats.lastUpdate) / 1000;
    this.stats.lastUpdate = now;
    this.stats.frameCount++;
    
    // Update state
    this.state.time += deltaTime;
    
    // Update agents
    this.agents.forEach(agent => {
      this.updateAgent(agent, deltaTime);
    });
    
    // Update leaderboard
    this.updateLeaderboard();
    
    // Update FPS
    if (this.stats.frameCount % 10 === 0) {
      this.stats.fps = Math.round(10 / deltaTime);
    }
    
    // Display dashboard every 2 seconds
    if (this.stats.frameCount % 20 === 0) {
      this.displayDashboard();
    }
  }

  /**
   * Update individual agent
   */
  updateAgent(agent, deltaTime) {
    if (agent.status !== 'racing') return;
    
    // Calculate speed based on weather and conditions
    let targetSpeed = agent.maxSpeed;
    
    // Weather effects
    switch (this.state.weather) {
      case 'rain':
        targetSpeed *= 0.8;
        break;
      case 'storm':
        targetSpeed *= 0.6;
        break;
      case 'cloudy':
        targetSpeed *= 0.95;
        break;
    }
    
    // Tire wear effects
    targetSpeed *= (1 - agent.tireWear / 200);
    
    // Fuel effects
    if (agent.fuel < 20) {
      targetSpeed *= 0.9;
    }
    
    // Update speed
    const speedDiff = targetSpeed - agent.speed;
    agent.speed += speedDiff * agent.acceleration * deltaTime;
    agent.speed = Math.max(0, agent.speed);
    
    // Update position
    const distance = (agent.speed * deltaTime) / 3600; // Convert km/h to km/s
    agent.position += distance;
    agent.totalTime += deltaTime;
    agent.currentLapTime += deltaTime;
    
    // Check for lap completion
    if (agent.position >= this.scenario.trackLength) {
      agent.lap++;
      agent.position = 0;
      
      // Update best lap time
      if (agent.currentLapTime < agent.bestLapTime) {
        agent.bestLapTime = agent.currentLapTime;
      }
      
      agent.currentLapTime = 0;
    }
    
    // Update fuel and tire wear
    agent.fuel -= deltaTime * 0.5;
    agent.tireWear += deltaTime * 0.3;
    
    // Check for pit stop
    if (agent.fuel < 10 || agent.tireWear > 80) {
      agent.status = 'pitting';
      setTimeout(() => {
        agent.status = 'racing';
        agent.fuel = 100;
        agent.tireWear = 0;
      }, 3000); // 3 second pit stop
    }
  }

  /**
   * Update leaderboard
   */
  updateLeaderboard() {
    // Sort agents by position and lap
    this.leaderboard = [...this.agents].sort((a, b) => {
      if (a.lap !== b.lap) return b.lap - a.lap;
      return b.position - a.position;
    });
  }

  /**
   * Display dashboard
   */
  displayDashboard() {
    // Clear screen
    console.clear();
    
    // Header
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log(`║                    ${this.scenario.icon} ${this.scenario.name.toUpperCase()} ${this.scenario.icon}                    ║`);
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    
    // Race info
    console.log(`\n⏰ Time: ${this.formatTime(this.state.time)} | 🏁 Lap: ${this.state.lap} | 🌤️ Weather: ${this.state.weather} (${this.state.temperature.toFixed(1)}°C)`);
    console.log(`📊 FPS: ${this.stats.fps} | 🚨 Incidents: ${this.state.incidents} | 📡 Events: ${this.events.length}`);
    
    // Leaderboard
    console.log('\n🏆 LIVE LEADERBOARD:');
    console.log('┌─────┬─────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
    console.log('│ Pos │ Name            │ Lap         │ Position    │ Speed       │ Status      │');
    console.log('├─────┼─────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
    
    this.leaderboard.slice(0, 15).forEach((agent, index) => {
      const pos = index + 1;
      const name = agent.name.padEnd(15);
      const lap = agent.lap.toString().padStart(3);
      const position = `${agent.position.toFixed(2)}km`.padStart(8);
      const speed = `${agent.speed.toFixed(0)}km/h`.padStart(8);
      const status = agent.status.padEnd(10);
      const icon = agent.color;
      
      console.log(`│ ${pos.toString().padStart(3)} │ ${icon} ${name} │ ${lap} │ ${position} │ ${speed} │ ${status} │`);
    });
    
    console.log('└─────┴─────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');
    
    // Recent events
    if (this.events.length > 0) {
      console.log('\n📡 RECENT EVENTS:');
      this.events.slice(-5).forEach(event => {
        const time = this.formatTime(event.time);
        const agent = event.agent ? ` (${event.agent})` : '';
        console.log(`   ${time} - ${event.description}${agent}`);
      });
    }
    
    // Statistics
    console.log('\n📊 RACE STATISTICS:');
    const leader = this.leaderboard[0];
    if (leader) {
      console.log(`   🥇 Leader: ${leader.name} (Lap ${leader.lap}, ${leader.speed.toFixed(0)}km/h)`);
      console.log(`   🏁 Fastest Lap: ${this.formatTime(Math.min(...this.agents.map(a => a.bestLapTime)))}`);
      console.log(`   🚨 Total Incidents: ${this.state.incidents}`);
      console.log(`   🔧 Total Pit Stops: ${this.agents.reduce((sum, a) => sum + a.pitStops, 0)}`);
    }
    
    console.log('\n🎮 Controls: Ctrl+C to stop simulation');
  }

  /**
   * Format time
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  /**
   * Stop the simulation
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Simulation is not running');
      return;
    }
    
    console.log('\n🏁 Stopping simulation...');
    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Display final results
    this.displayFinalResults();
    
    console.log('✅ Simulation stopped');
  }

  /**
   * Display final results
   */
  displayFinalResults() {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                              🏁 FINAL RESULTS 🏁                           ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    
    console.log(`\n⏰ Total Race Time: ${this.formatTime(this.state.time)}`);
    console.log(`🏁 Total Laps: ${this.state.lap}`);
    console.log(`🚨 Total Incidents: ${this.state.incidents}`);
    console.log(`📡 Total Events: ${this.events.length}`);
    
    console.log('\n🏆 FINAL LEADERBOARD:');
    console.log('┌─────┬─────────────────┬─────────────┬─────────────┬─────────────┐');
    console.log('│ Pos │ Name            │ Total Time  │ Best Lap    │ Incidents   │');
    console.log('├─────┼─────────────────┼─────────────┼─────────────┼─────────────┤');
    
    this.leaderboard.slice(0, 10).forEach((agent, index) => {
      const pos = index + 1;
      const name = agent.name.padEnd(15);
      const totalTime = this.formatTime(agent.totalTime);
      const bestLap = this.formatTime(agent.bestLapTime);
      const incidents = agent.incidents.toString().padStart(3);
      const icon = agent.color;
      
      console.log(`│ ${pos.toString().padStart(3)} │ ${icon} ${name} │ ${totalTime} │ ${bestLap} │ ${incidents} │`);
    });
    
    console.log('└─────┴─────────────────┴─────────────┴─────────────┴─────────────┘');
    
    console.log('\n🎉 Thank you for using VelocityForge Competitive Mobility Simulator!');
  }

  /**
   * Get simulation status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      scenario: this.scenario,
      agents: this.agents.length,
      time: this.state.time,
      leaderboard: this.leaderboard.slice(0, 5),
      events: this.events.slice(-5),
      stats: this.stats
    };
  }
}

// Main execution
async function main() {
  const simulator = new CompetitiveMobilitySimulator();
  
  // Get scenario type from command line or default to F1
  const scenarioType = process.argv[2] || 'f1';
  
  // Initialize simulator
  const initialized = simulator.initialize(scenarioType);
  if (!initialized) {
    console.error('❌ Failed to initialize simulator');
    process.exit(1);
  }
  
  // Start simulator
  simulator.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    simulator.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    simulator.stop();
    process.exit(0);
  });
  
  // Keep the process alive
  setInterval(() => {
    // Keep alive
  }, 1000);
}

// Run the simulator
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Simulator failed:', error);
    process.exit(1);
  });
}

export { CompetitiveMobilitySimulator };
