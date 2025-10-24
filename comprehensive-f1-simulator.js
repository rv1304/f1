/**
 * VelocityForge Comprehensive F1 Race Simulator
 * 
 * A complete F1 race simulator that can:
 * - Track live races with real data
 * - Simulate races with realistic scenarios
 * - Handle weather changes, safety cars, pit stops
 * - Provide real-time predictions and analysis
 */

import { RealTimeF1RaceTracker } from './live-f1-tracker.js';
import { F1GrandPrixScenario } from './src/scenarios/F1GrandPrixScenario.js';

export class ComprehensiveF1Simulator {
  constructor() {
    this.tracker = new RealTimeF1RaceTracker();
    this.scenario = new F1GrandPrixScenario();
    this.mode = 'live'; // 'live' or 'simulation'
    this.isRunning = false;
    
    // Race configuration
    this.config = {
      trackId: 'monaco',
      sessionType: 'race',
      raceLength: 78,
      maxDuration: 120,
      enableWeatherChanges: true,
      enableSafetyCar: true,
      enablePitStops: true,
      enableIncidents: true,
      realTimeData: true
    };
    
    // Race state
    this.raceState = {
      currentLap: 0,
      sessionTime: 0,
      weather: null,
      safetyCar: false,
      virtualSafetyCar: false,
      redFlag: false,
      incidents: [],
      pitStops: [],
      predictions: null
    };
  }

  /**
   * Initialize the comprehensive F1 simulator
   */
  async initialize(config = {}) {
    console.log('🏎️ Initializing Comprehensive F1 Simulator...');
    
    try {
      // Merge configuration
      this.config = { ...this.config, ...config };
      
      // Try to initialize live tracking first
      const liveInitialized = await this.tracker.initialize();
      
      if (liveInitialized) {
        this.mode = 'live';
        console.log('📡 Live F1 session detected - running in LIVE mode');
        
        // Setup live event listeners
        this.setupLiveEventListeners();
        
      } else {
        this.mode = 'simulation';
        console.log('🎮 No live session - running in SIMULATION mode');
        
        // Initialize simulation scenario
        await this.scenario.initialize(this.config);
      }
      
      console.log('✅ Comprehensive F1 Simulator initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Comprehensive F1 Simulator:', error);
      return false;
    }
  }

  /**
   * Setup live event listeners
   */
  setupLiveEventListeners() {
    this.tracker.on('update', (raceData) => {
      this.handleLiveUpdate(raceData);
    });
    
    this.tracker.on('predictions', (predictions) => {
      this.handleLivePredictions(predictions);
    });
  }

  /**
   * Handle live data updates
   */
  handleLiveUpdate(raceData) {
    this.raceState = {
      ...this.raceState,
      weather: raceData.weather,
      safetyCar: raceData.safetyCar,
      virtualSafetyCar: raceData.virtualSafetyCar,
      redFlag: raceData.redFlag,
      pitStops: raceData.pitStops,
      incidents: raceData.incidents
    };
    
    // Emit update event
    this.emit('raceUpdate', this.raceState);
  }

  /**
   * Handle live predictions
   */
  handleLivePredictions(predictions) {
    this.raceState.predictions = predictions;
    this.emit('predictions', predictions);
  }

  /**
   * Start the simulator
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Simulator is already running');
      return;
    }
    
    console.log('🏁 Starting Comprehensive F1 Simulator...');
    
    try {
      if (this.mode === 'live') {
        // Start live tracking
        this.tracker.start();
        console.log('📡 Live F1 tracking started');
        
        // Display live race information
        this.displayLiveRaceInfo();
        
      } else {
        // Start simulation
        this.scenario.start();
        console.log('🎮 F1 simulation started');
        
        // Display simulation information
        this.displaySimulationInfo();
      }
      
      this.isRunning = true;
      
      // Start status updates
      this.startStatusUpdates();
      
      console.log('✅ Comprehensive F1 Simulator started');
      
    } catch (error) {
      console.error('❌ Failed to start simulator:', error);
    }
  }

  /**
   * Start status updates
   */
  startStatusUpdates() {
    setInterval(() => {
      this.displayStatus();
    }, 5000);
  }

  /**
   * Display live race information
   */
  displayLiveRaceInfo() {
    const raceData = this.tracker.getRaceData();
    
    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                        🏎️ LIVE F1 RACE SIMULATOR 🏎️                        ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    
    if (raceData.session) {
      console.log(`\n📍 Session: ${raceData.session.session_name}`);
      console.log(`🏁 Location: ${raceData.session.location}`);
      console.log(`📅 Date: ${new Date(raceData.session.date_start).toLocaleDateString()}`);
      console.log(`⏰ Start: ${new Date(raceData.session.date_start).toLocaleTimeString()}`);
    }
    
    console.log('\n📡 Live Data Sources:');
    console.log('   • OpenF1 API - Live timing and positions');
    console.log('   • Real-time weather conditions');
    console.log('   • Safety car and VSC detection');
    console.log('   • Pit stop monitoring');
    console.log('   • Live race predictions');
    
    console.log('\n🎮 Controls: Ctrl+C to stop\n');
  }

  /**
   * Display simulation information
   */
  displaySimulationInfo() {
    const raceStatus = this.scenario.getRaceStatus();
    
    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                      🎮 F1 RACE SIMULATION 🎮                                ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    
    console.log(`\n📍 Track: ${raceStatus.track?.name || 'Circuit de Monaco'}`);
    console.log(`🌤️ Weather: ${raceStatus.weather?.temperature || 25}°C, ${raceStatus.weather?.weatherCondition || 'Clear'}`);
    console.log(`👥 Drivers: ${raceStatus.grid?.length || 10} drivers on grid`);
    console.log(`🔮 Prediction Confidence: ${(raceStatus.predictions?.confidence * 100 || 68.8).toFixed(1)}%`);
    
    console.log('\n🎮 Simulation Features:');
    console.log('   • Realistic F1 physics and dynamics');
    console.log('   • Dynamic weather system');
    console.log('   • Safety car and VSC scenarios');
    console.log('   • Pit stop strategies');
    console.log('   • Incident simulation');
    console.log('   • Live race predictions');
    
    console.log('\n🎮 Controls: Ctrl+C to stop\n');
  }

  /**
   * Display current status
   */
  displayStatus() {
    const now = new Date();
    
    if (this.mode === 'live') {
      this.displayLiveStatus(now);
    } else {
      this.displaySimulationStatus(now);
    }
  }

  /**
   * Display live status
   */
  displayLiveStatus(now) {
    const leaderboard = this.tracker.getLeaderboard();
    const weather = this.tracker.getWeather();
    const safetyCar = this.tracker.getSafetyCarStatus();
    const predictions = this.tracker.getPredictions();
    const pitStops = this.tracker.getPitStops();
    
    console.log(`\n⏰ ${now.toLocaleTimeString()} | 🏁 LIVE F1 RACE TRACKING`);
    
    // Display leaderboard
    if (leaderboard.length > 0) {
      console.log('\n🏆 LIVE LEADERBOARD:');
      leaderboard.slice(0, 10).forEach((driver, index) => {
        const gap = index === 0 ? '' : `+${driver.gap || '0.0'}s`;
        console.log(`   ${driver.position}. ${driver.driver} (${driver.team}) ${gap}`);
      });
    }
    
    // Display weather
    if (weather) {
      console.log(`\n🌤️ Weather: ${weather.temperature}°C | ${weather.humidity}% humidity | ${weather.windSpeed}m/s wind`);
      if (weather.rainfall > 0) {
        console.log(`   💧 Rainfall: ${weather.rainfall}mm/h`);
      }
    }
    
    // Display safety car status
    if (safetyCar.safetyCar) {
      console.log('\n🚨 SAFETY CAR DEPLOYED');
    } else if (safetyCar.virtualSafetyCar) {
      console.log('\n⚠️ VIRTUAL SAFETY CAR');
    } else if (safetyCar.redFlag) {
      console.log('\n🔴 RED FLAG');
    }
    
    // Display predictions
    if (predictions) {
      console.log(`\n🔮 Live Predictions (${(predictions.confidence * 100).toFixed(0)}% confidence):`);
      if (predictions.winner) {
        console.log(`   🏆 Predicted Winner: ${predictions.winner.driver.name}`);
      }
      if (predictions.weatherImpact) {
        console.log(`   🌤️ Weather Impact: ${predictions.weatherImpact.description}`);
      }
    }
    
    // Display pit stops
    if (pitStops.length > 0) {
      console.log(`\n🔧 Recent Pit Stops: ${pitStops.length} total`);
      pitStops.slice(-3).forEach(pit => {
        console.log(`   ${pit.driver.name} - Lap ${pit.lap} (${pit.pitDuration}s)`);
      });
    }
  }

  /**
   * Display simulation status
   */
  displaySimulationStatus(now) {
    const raceStatus = this.scenario.getRaceStatus();
    
    console.log(`\n⏰ ${now.toLocaleTimeString()} | 🎮 F1 SIMULATION`);
    console.log(`🏁 Lap ${raceStatus.currentLap || 0} | ⏱️ ${(raceStatus.sessionTime || 0).toFixed(1)}s`);
    
    // Display leaderboard
    if (raceStatus.leaderboard && raceStatus.leaderboard.length > 0) {
      console.log('\n🏆 SIMULATION LEADERBOARD:');
      raceStatus.leaderboard.slice(0, 10).forEach((driver, index) => {
        const gap = index === 0 ? '' : `+${driver.gapToLeader?.toFixed(1) || '0.0'}s`;
        console.log(`   ${driver.position}. ${driver.driver} (${driver.team}) ${gap}`);
      });
    }
    
    // Display weather
    if (raceStatus.weather) {
      const weather = raceStatus.weather;
      console.log(`\n🌤️ Weather: ${weather.temperature}°C | ${weather.humidity}% humidity | ${weather.windSpeed}m/s wind`);
      if (weather.precipitation > 0) {
        console.log(`   💧 Precipitation: ${weather.precipitation.toFixed(1)}mm/h`);
      }
    }
    
    // Display safety car status
    if (raceStatus.safetyCar) {
      console.log('\n🚨 SAFETY CAR DEPLOYED');
    } else if (raceStatus.virtualSafetyCar) {
      console.log('\n⚠️ VIRTUAL SAFETY CAR');
    } else if (raceStatus.redFlag) {
      console.log('\n🔴 RED FLAG');
    }
    
    // Display predictions
    if (raceStatus.predictions) {
      console.log(`\n🔮 Simulation Predictions: ${(raceStatus.predictions.confidence * 100).toFixed(1)}% confidence`);
    }
  }

  /**
   * Stop the simulator
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Simulator is not running');
      return;
    }
    
    console.log('\n🏁 Stopping Comprehensive F1 Simulator...');
    
    if (this.mode === 'live') {
      this.tracker.stop();
    } else {
      this.scenario.destroy();
    }
    
    this.isRunning = false;
    console.log('✅ Comprehensive F1 Simulator stopped');
    
    // Display final statistics
    this.displayFinalStats();
  }

  /**
   * Display final statistics
   */
  displayFinalStats() {
    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                              📊 FINAL STATISTICS 📊                         ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    
    if (this.mode === 'live') {
      const stats = this.tracker.getStats();
      console.log(`\n📡 Live Tracking Statistics:`);
      console.log(`   • Mode: Live F1 Race Tracking`);
      console.log(`   • API Requests: ${stats.requestsMade}`);
      console.log(`   • Errors: ${stats.errors}`);
      console.log(`   • Session Duration: ${(stats.sessionDuration / 1000).toFixed(1)}s`);
      console.log(`   • Last Update: ${stats.lastUpdate}`);
    } else {
      const raceStatus = this.scenario.getRaceStatus();
      console.log(`\n🎮 Simulation Statistics:`);
      console.log(`   • Mode: F1 Race Simulation`);
      console.log(`   • Total Laps: ${raceStatus.currentLap || 0}`);
      console.log(`   • Session Time: ${(raceStatus.sessionTime || 0).toFixed(1)}s`);
      console.log(`   • Incidents: ${raceStatus.incidents || 0}`);
      console.log(`   • Safety Car Deployments: ${raceStatus.safetyCar ? 1 : 0}`);
    }
    
    console.log('\n🎉 Thank you for using VelocityForge Comprehensive F1 Simulator!');
  }

  /**
   * Get current race data
   */
  getRaceData() {
    if (this.mode === 'live') {
      return this.tracker.getRaceData();
    } else {
      return this.scenario.getRaceStatus();
    }
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.mode;
  }

  /**
   * Get simulator status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      mode: this.mode,
      raceState: this.raceState,
      config: this.config
    };
  }
}

// Main execution
async function main() {
  const simulator = new ComprehensiveF1Simulator();
  
  // Initialize simulator
  const initialized = await simulator.initialize({
    trackId: 'monaco',
    sessionType: 'race',
    raceLength: 78,
    maxDuration: 120,
    enableWeatherChanges: true,
    enableSafetyCar: true,
    enablePitStops: true,
    enableIncidents: true,
    realTimeData: true
  });
  
  if (!initialized) {
    console.error('❌ Failed to initialize simulator');
    process.exit(1);
  }
  
  // Start simulator
  await simulator.start();
  
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
    console.error('❌ Comprehensive F1 Simulator failed:', error);
    process.exit(1);
  });
}

// Export is already defined above
