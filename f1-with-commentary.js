/**
 * F1 Simulator with Live Commentary
 * 
 * Enhanced F1 simulator that includes live commentary system
 * Works with the existing real-f1-simulator.js without modifying it
 */

import { RealF1Simulator } from './real-f1-simulator.js';
import { F1CommentarySystem } from './f1-commentary.js';

class F1SimulatorWithCommentary extends RealF1Simulator {
  constructor() {
    super();
    
    // Initialize commentary system
    this.commentary = new F1CommentarySystem();
    this.commentaryEnabled = true;
  }

  /**
   * Initialize with commentary
   */
  initialize(trackId = 'monaco') {
    console.log('🏎️ Initializing F1 Simulator with Live Commentary...');
    
    // Initialize base simulator
    const initialized = super.initialize(trackId);
    if (!initialized) {
      return false;
    }
    
    // Start commentary system
    if (this.commentaryEnabled) {
      this.commentary.start();
    }
    
    console.log('✅ F1 Simulator with Live Commentary initialized');
    return true;
  }

  /**
   * Start race with commentary
   */
  start() {
    console.log('🏁 Starting F1 Grand Prix with Live Commentary...');
    
    // Start base simulator
    super.start();
    
    // Start commentary
    if (this.commentaryEnabled) {
      this.commentary.start();
    }
    
    console.log('✅ F1 Grand Prix with Live Commentary started');
  }

  /**
   * Stop race and commentary
   */
  stop() {
    console.log('🏁 Stopping F1 Grand Prix and Commentary...');
    
    // Stop commentary first
    if (this.commentaryEnabled) {
      this.commentary.stop();
    }
    
    // Stop base simulator
    super.stop();
    
    console.log('✅ F1 Grand Prix and Commentary stopped');
  }

  /**
   * Enhanced update method with commentary integration
   */
  update() {
    // Call base update
    super.update();
    
    // Update commentary with race data
    if (this.commentaryEnabled && this.commentary.isActive) {
      this.commentary.updateRaceData({
        lap: this.raceState.lap,
        totalLaps: this.raceState.totalLaps,
        remaining: this.raceState.totalLaps - this.raceState.lap,
        weather: this.raceState.weather,
        safetyCar: this.raceState.safetyCar
      });
    }
  }

  /**
   * Enhanced event triggering with commentary
   */
  triggerEvent(type) {
    // Call base event trigger
    super.triggerEvent(type);
    
    // Add commentary for events
    if (this.commentaryEnabled && this.commentary.isActive) {
      const event = this.events[this.events.length - 1]; // Get the last event
      if (event && event.driver) {
        const driverData = this.drivers.find(d => d.name === event.driver);
        if (driverData) {
          this.commentary.handleDriverEvent(type, driverData);
        }
      }
    }
  }

  /**
   * Enhanced display with commentary integration
   */
  displayRace() {
    // Call base display
    super.displayRace();
    
    // Add commentary status
    if (this.commentaryEnabled && this.commentary.isActive) {
      console.log(`\n🎤 Live Commentary: ${this.commentary.currentCommentator.name}`);
    }
  }

  /**
   * Toggle commentary on/off
   */
  toggleCommentary() {
    this.commentaryEnabled = !this.commentaryEnabled;
    
    if (this.commentaryEnabled) {
      this.commentary.start();
      console.log('🎤 Live Commentary: ON');
    } else {
      this.commentary.stop();
      console.log('🎤 Live Commentary: OFF');
    }
  }

  /**
   * Get enhanced status
   */
  getStatus() {
    const baseStatus = super.getStatus();
    const commentaryStatus = this.commentary.getStatus();
    
    return {
      ...baseStatus,
      commentary: commentaryStatus,
      commentaryEnabled: this.commentaryEnabled
    };
  }
}

// Main execution
async function main() {
  const simulator = new F1SimulatorWithCommentary();
  
  // Get track from command line or default to Monaco
  const trackId = process.argv[2] || 'monaco';
  
  // Initialize simulator with commentary
  const initialized = simulator.initialize(trackId);
  if (!initialized) {
    console.error('❌ Failed to initialize F1 simulator with commentary');
    process.exit(1);
  }
  
  // Start race with commentary
  simulator.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, stopping race and commentary...');
    simulator.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, stopping race and commentary...');
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
    console.error('❌ F1 simulator with commentary failed:', error);
    process.exit(1);
  });
}

export { F1SimulatorWithCommentary };
