/**
 * VelocityForge Console Dashboard
 * 
 * Real-time console output for monitoring simulation progress
 */

export class ConsoleDashboard {
  constructor(simulation) {
    this.simulation = simulation;
    this.isRunning = false;
    this.updateInterval = null;
    this.lastUpdateTime = 0;
    this.updateFrequency = 1000; // Update every second
    
    // Statistics tracking
    this.stats = {
      startTime: 0,
      lastStats: null,
      eventCount: 0
    };
  }

  /**
   * Start the console dashboard
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.stats.startTime = performance.now();
    
    // Clear console and show initial state
    console.clear();
    this.showHeader();
    
    // Start update loop
    this.updateInterval = setInterval(() => {
      this.update();
    }, this.updateFrequency);
    
    console.log('📊 Console dashboard started');
  }

  /**
   * Stop the console dashboard
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.showFinalStats();
    console.log('📊 Console dashboard stopped');
  }

  /**
   * Show header
   */
  showHeader() {
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                           🏁 VELOCITYFORGE SIMULATION 🏁                    ║');
    console.log('║                    Real-Time Competitive Mobility Simulator                   ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log('');
  }

  /**
   * Update dashboard display
   */
  update() {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const runtime = (currentTime - this.stats.startTime) / 1000;
    
    // Get simulation stats
    const simStats = this.simulation.getStats();
    const leaderboard = this.simulation.getLeaderboard();
    const agents = this.simulation.getAgents();
    
    // Clear previous output (move cursor up)
    this.clearPreviousOutput();
    
    // Show runtime and basic stats
    console.log(`⏱️  Runtime: ${runtime.toFixed(1)}s | 🎯 Agents: ${simStats.agentsActive} | 📊 FPS: ${simStats.fps.toFixed(1)}`);
    console.log(`🔧 Physics Updates: ${simStats.physicsUpdates} | 📡 Events: ${simStats.eventsProcessed} | ⚡ Avg Tick: ${simStats.averageTickTime.toFixed(2)}ms`);
    console.log('');
    
    // Show agent positions and status
    console.log('🤖 AGENT STATUS:');
    console.log('┌─────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
    console.log('│ Name            │ Position    │ Speed       │ Behavior    │ Status      │');
    console.log('├─────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
    
    agents.slice(0, 8).forEach(agent => {
      const pos = `${agent.position.x.toFixed(1)},${agent.position.y.toFixed(1)},${agent.position.z.toFixed(1)}`;
      const speed = agent.velocity.length().toFixed(1);
      const behavior = agent.ai.behavior;
      const status = agent.isAlive ? '🟢 Active' : '🔴 Dead';
      
      console.log(`│ ${agent.name.padEnd(15)} │ ${pos.padEnd(11)} │ ${speed.padEnd(11)} │ ${behavior.padEnd(11)} │ ${status.padEnd(11)} │`);
    });
    
    console.log('└─────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');
    console.log('');
    
    // Show leaderboard
    if (leaderboard && leaderboard.position) {
      console.log('🏆 LEADERBOARD (Position):');
      console.log('┌─────┬─────────────────┬─────────────┬─────────────┬─────────────┐');
      console.log('│ Rank│ Name            │ Distance    │ Speed       │ Efficiency  │');
      console.log('├─────┼─────────────────┼─────────────┼─────────────┼─────────────┤');
      
      leaderboard.position.slice(0, 5).forEach((standing, index) => {
        const rank = (index + 1).toString().padStart(3);
        const name = standing.agentName.padEnd(15);
        const distance = standing.value.toFixed(1).padEnd(11);
        const speed = standing.agent.velocity.length().toFixed(1).padEnd(11);
        const efficiency = standing.agent.metrics.efficiency.toFixed(2).padEnd(11);
        
        console.log(`│ ${rank} │ ${name} │ ${distance} │ ${speed} │ ${efficiency} │`);
      });
      
      console.log('└─────┴─────────────────┴─────────────┴─────────────┴─────────────┘');
      console.log('');
    }
    
    // Show performance warnings
    if (simStats.performance && simStats.performance.warnings > 0) {
      console.log(`⚠️  Performance Warnings: ${simStats.performance.warnings}`);
    }
    
    // Show controls
    console.log('🎮 Controls: Ctrl+C to stop simulation');
    console.log('');
    
    this.stats.lastStats = simStats;
  }

  /**
   * Clear previous output
   */
  clearPreviousOutput() {
    // Clear screen and move cursor to top
    process.stdout.write('\x1B[2J\x1B[0f');
  }

  /**
   * Show final statistics
   */
  showFinalStats() {
    const runtime = (performance.now() - this.stats.startTime) / 1000;
    const simStats = this.simulation.getStats();
    
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                              🏁 SIMULATION COMPLETE 🏁                      ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`⏱️  Total Runtime: ${runtime.toFixed(1)} seconds`);
    console.log(`🎯 Total Agents: ${simStats.agentsActive}`);
    console.log(`📊 Average FPS: ${simStats.fps.toFixed(1)}`);
    console.log(`🔧 Physics Updates: ${simStats.physicsUpdates}`);
    console.log(`📡 Events Processed: ${simStats.eventsProcessed}`);
    console.log(`⚡ Average Tick Time: ${simStats.averageTickTime.toFixed(2)}ms`);
    console.log('');
    
    // Show final leaderboard
    const leaderboard = this.simulation.getLeaderboard();
    if (leaderboard && leaderboard.position) {
      console.log('🏆 FINAL LEADERBOARD:');
      leaderboard.position.slice(0, 3).forEach((standing, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        console.log(`${medal} ${index + 1}. ${standing.agentName} - Distance: ${standing.value.toFixed(1)}`);
      });
    }
    
    console.log('');
    console.log('🎉 Thank you for using VelocityForge!');
  }

  /**
   * Handle simulation events
   */
  onSimulationEvent(eventType, data) {
    switch (eventType) {
      case 'simulation:collision':
        console.log(`💥 COLLISION: ${data.agent1.name} ↔ ${data.agent2.name}`);
        break;
      case 'simulation:lapComplete':
        console.log(`🏆 LAP COMPLETE: ${data.agent.name} - ${data.lapTime.toFixed(2)}s`);
        break;
      case 'simulation:incident':
        console.log(`⚠️  INCIDENT: ${data.agent.name} - ${data.incidentType} (${data.severity})`);
        break;
    }
  }
}
