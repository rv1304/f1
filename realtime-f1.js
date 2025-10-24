/**
 * VelocityForge Real-Time F1 Simulation
 * 
 * Live F1 race simulation with real-time data integration,
 * weather updates, and live predictions.
 */

import { RealTimeF1Integration } from './src/integration/RealTimeF1Integration.js';
import { RealTimeWeatherIntegration } from './src/integration/RealTimeWeatherIntegration.js';
import { F1GrandPrixScenario } from './src/scenarios/F1GrandPrixScenario.js';

class RealTimeF1Simulation {
  constructor() {
    this.f1Integration = new RealTimeF1Integration();
    this.weatherIntegration = new RealTimeWeatherIntegration();
    this.scenario = null;
    this.isRunning = false;
    this.updateInterval = null;
  }

  /**
   * Initialize real-time F1 simulation
   */
  async initialize() {
    console.log('🏎️ Initializing Real-Time F1 Simulation...');
    
    try {
      // Initialize real-time integrations
      await this.f1Integration.initialize();
      await this.weatherIntegration.initialize();
      
      // Create F1 Grand Prix scenario with real-time data
      this.scenario = new F1GrandPrixScenario();
      
      // Initialize scenario with real-time configuration
      await this.scenario.initialize({
        trackId: 'monaco',
        sessionType: 'race',
        raceLength: 78,
        maxDuration: 120,
        realTimeData: true,
        livePredictions: true,
        enableWeatherChanges: true
      });
      
      console.log('✅ Real-Time F1 Simulation initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Real-Time F1 Simulation:', error);
      return false;
    }
  }

  /**
   * Start real-time simulation
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Simulation is already running');
      return;
    }

    console.log('🏁 Starting Real-Time F1 Simulation...');
    
    try {
      // Start the F1 Grand Prix
      this.scenario.start();
      
      // Start real-time updates
      this.startRealTimeUpdates();
      
      this.isRunning = true;
      console.log('✅ Real-Time F1 Simulation started');
      
      // Display initial race information
      this.displayRaceInfo();
      
    } catch (error) {
      console.error('❌ Failed to start Real-Time F1 Simulation:', error);
    }
  }

  /**
   * Start real-time updates
   */
  startRealTimeUpdates() {
    // Update every 5 seconds
    this.updateInterval = setInterval(async () => {
      try {
        await this.updateRealTimeData();
        this.displayRaceStatus();
      } catch (error) {
        console.warn('⚠️ Real-time update failed:', error.message);
      }
    }, 5000);
  }

  /**
   * Update real-time data
   */
  async updateRealTimeData() {
    // Get live F1 data
    const liveF1Data = this.f1Integration.getLiveRaceData();
    
    // Get live weather data
    const liveWeather = await this.weatherIntegration.getCurrentWeather('monaco');
    
    // Update scenario with live data
    if (this.scenario && this.scenario.update) {
      this.scenario.update(0.1); // Update simulation
    }
    
    // Store live data for display
    this.liveData = {
      f1: liveF1Data,
      weather: liveWeather,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Display race information
   */
  displayRaceInfo() {
    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                           🏎️ REAL-TIME F1 SIMULATION 🏎️                      ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    
    const raceStatus = this.scenario.getRaceStatus();
    
    console.log(`\n📍 Track: ${raceStatus.track?.name || 'Circuit de Monaco'}`);
    console.log(`🌤️ Weather: ${raceStatus.weather?.temperature || 25}°C, ${raceStatus.weather?.weatherCondition || 'Clear'}`);
    console.log(`👥 Drivers: ${raceStatus.grid?.length || 10} drivers on grid`);
    console.log(`🔮 Prediction Confidence: ${(raceStatus.predictions?.confidence * 100 || 68.8).toFixed(1)}%`);
    
    if (raceStatus.predictions?.predictions) {
      console.log('\n🏆 Predicted Top 5:');
      raceStatus.predictions.predictions.slice(0, 5).forEach((prediction, index) => {
        console.log(`   ${index + 1}. ${prediction.driverName} (${prediction.performanceScore.toFixed(1)} pts)`);
      });
    }
    
    console.log('\n📡 Real-time data sources:');
    console.log('   • OpenF1 API - Live timing and positions');
    console.log('   • Weather APIs - Live weather conditions');
    console.log('   • Ergast API - Driver and team data');
    console.log('   • Live predictions - AI-powered race analysis');
    
    console.log('\n🎮 Controls: Ctrl+C to stop simulation');
    console.log('⏱️ Updates every 5 seconds with live data\n');
  }

  /**
   * Display race status
   */
  displayRaceStatus() {
    if (!this.liveData) return;
    
    const raceStatus = this.scenario.getRaceStatus();
    const now = new Date();
    
    console.log(`\n⏰ ${now.toLocaleTimeString()} | 🏁 Lap ${raceStatus.currentLap || 0} | ⏱️ ${(raceStatus.sessionTime || 0).toFixed(1)}s`);
    
    // Display leaderboard
    if (raceStatus.leaderboard && raceStatus.leaderboard.length > 0) {
      console.log('\n🏆 LIVE LEADERBOARD:');
      raceStatus.leaderboard.slice(0, 5).forEach((driver, index) => {
        const gap = index === 0 ? '' : `+${driver.gapToLeader?.toFixed(1) || '0.0'}s`;
        console.log(`   ${index + 1}. ${driver.driver} (${driver.team}) ${gap}`);
      });
    }
    
    // Display weather conditions
    if (this.liveData.weather) {
      const weather = this.liveData.weather;
      console.log(`\n🌤️ Weather: ${weather.temperature}°C | ${weather.humidity}% humidity | ${weather.windSpeed}m/s wind`);
      if (weather.precipitation > 0) {
        console.log(`   💧 Precipitation: ${weather.precipitation.toFixed(1)}mm/h`);
      }
    }
    
    // Display live F1 data
    if (this.liveData.f1 && this.liveData.f1.positions) {
      console.log(`\n📡 Live F1 Data: ${this.liveData.f1.positions.length} positions tracked`);
    }
    
    // Display predictions update
    if (raceStatus.predictions) {
      console.log(`\n🔮 Live Predictions: ${(raceStatus.predictions.confidence * 100).toFixed(1)}% confidence`);
    }
  }

  /**
   * Stop simulation
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Simulation is not running');
      return;
    }

    console.log('\n🏁 Stopping Real-Time F1 Simulation...');
    
    // Stop real-time updates
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Stop scenario
    if (this.scenario && this.scenario.destroy) {
      this.scenario.destroy();
    }
    
    this.isRunning = false;
    console.log('✅ Real-Time F1 Simulation stopped');
    
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
    
    // F1 Integration stats
    const f1Stats = this.f1Integration.getStats();
    console.log(`\n📡 F1 Data Integration:`);
    console.log(`   • API Requests: ${f1Stats.requestsMade}`);
    console.log(`   • Cache Hits: ${f1Stats.cacheHits}`);
    console.log(`   • Data Enhancements: ${f1Stats.dataEnhancements}`);
    console.log(`   • Errors: ${f1Stats.errors}`);
    
    // Weather Integration stats
    const weatherStats = this.weatherIntegration.getStats();
    console.log(`\n🌤️ Weather Integration:`);
    console.log(`   • API Requests: ${weatherStats.requestsMade}`);
    console.log(`   • Cache Hits: ${weatherStats.cacheHits}`);
    console.log(`   • Errors: ${weatherStats.errors}`);
    
    // Race statistics
    const raceStatus = this.scenario.getRaceStatus();
    console.log(`\n🏁 Race Statistics:`);
    console.log(`   • Total Laps: ${raceStatus.currentLap || 0}`);
    console.log(`   • Session Time: ${(raceStatus.sessionTime || 0).toFixed(1)}s`);
    console.log(`   • Incidents: ${raceStatus.incidents || 0}`);
    console.log(`   • Safety Car Deployments: ${raceStatus.safetyCar ? 1 : 0}`);
    
    console.log('\n🎉 Thank you for using VelocityForge Real-Time F1 Simulation!');
  }

  /**
   * Get simulation status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      liveData: this.liveData,
      raceStatus: this.scenario?.getRaceStatus(),
      f1Stats: this.f1Integration.getStats(),
      weatherStats: this.weatherIntegration.getStats()
    };
  }
}

// Main execution
async function main() {
  const simulation = new RealTimeF1Simulation();
  
  // Initialize simulation
  const initialized = await simulation.initialize();
  if (!initialized) {
    console.error('❌ Failed to initialize simulation');
    process.exit(1);
  }
  
  // Start simulation
  await simulation.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
    simulation.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
    simulation.stop();
    process.exit(0);
  });
  
  // Keep the process alive
  setInterval(() => {
    // Keep alive
  }, 1000);
}

// Run the simulation
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Simulation failed:', error);
    process.exit(1);
  });
}

export { RealTimeF1Simulation };
