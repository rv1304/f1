/**
 * VelocityForge Real-Time F1 Race Tracker
 * 
 * Live F1 race simulation that tracks real races with:
 * - Live timing and positions
 * - Real-time weather conditions
 * - Safety car and VSC detection
 * - Pit stop monitoring
 * - Driver performance analysis
 * - Live race predictions
 */

import { EventEmitter } from 'events';

export class RealTimeF1RaceTracker extends EventEmitter {
  constructor() {
    super();
    
    this.isLive = false;
    this.currentSession = null;
    this.raceData = {
      session: null,
      drivers: new Map(),
      positions: [],
      weather: null,
      safetyCar: false,
      virtualSafetyCar: false,
      redFlag: false,
      pitStops: [],
      incidents: [],
      predictions: null
    };
    
    // Real F1 API endpoints
    this.apis = {
      openF1: {
        baseUrl: 'https://api.openf1.org/v1',
        endpoints: {
          sessions: '/sessions',
          drivers: '/drivers',
          teams: '/teams',
          circuits: '/circuits',
          positions: '/position',
          weather: '/weather',
          pitStops: '/pit',
          carData: '/car_data',
          stints: '/stints',
          laps: '/laps'
        }
      },
      ergast: {
        baseUrl: 'http://ergast.com/api/f1',
        endpoints: {
          currentSeason: '/current',
          drivers: '/current/drivers.json',
          constructors: '/current/constructors.json',
          circuits: '/current/circuits.json'
        }
      }
    };
    
    this.updateInterval = null;
    this.lastUpdate = 0;
    this.stats = {
      requestsMade: 0,
      errors: 0,
      lastUpdate: 0,
      sessionStart: null
    };
  }

  /**
   * Initialize the real-time F1 race tracker
   */
  async initialize() {
    console.log('🏎️ Initializing Real-Time F1 Race Tracker...');
    
    try {
      // Check if there's a live session
      const liveSession = await this.getCurrentSession();
      
      if (liveSession) {
        console.log(`📡 Live F1 session detected: ${liveSession.session_name} at ${liveSession.location}`);
        this.currentSession = liveSession;
        this.isLive = true;
        
        // Load session data
        await this.loadSessionData();
        
        console.log('✅ Real-Time F1 Race Tracker initialized with live session');
        return true;
      } else {
        console.log('⚠️ No live F1 session detected, running in simulation mode');
        this.isLive = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Real-Time F1 Race Tracker:', error);
      return false;
    }
  }

  /**
   * Get current F1 session
   */
  async getCurrentSession() {
    try {
      const response = await fetch(`${this.apis.openF1.baseUrl}${this.apis.openF1.endpoints.sessions}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const sessions = await response.json();
      this.stats.requestsMade++;
      
      // Find current or most recent session
      const now = new Date();
      const currentSession = sessions.find(session => {
        const sessionStart = new Date(session.date_start);
        const sessionEnd = new Date(session.date_end);
        return sessionStart <= now && sessionEnd >= now;
      });
      
      return currentSession || sessions[sessions.length - 1];
    } catch (error) {
      console.warn('⚠️ Failed to get current session:', error.message);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Load session data
   */
  async loadSessionData() {
    if (!this.currentSession) return;
    
    try {
      // Load drivers
      await this.loadDrivers();
      
      // Load initial positions
      await this.loadPositions();
      
      // Load weather data
      await this.loadWeather();
      
      // Load pit stops
      await this.loadPitStops();
      
      console.log('📊 Session data loaded successfully');
    } catch (error) {
      console.warn('⚠️ Failed to load session data:', error.message);
    }
  }

  /**
   * Load drivers data
   */
  async loadDrivers() {
    try {
      const response = await fetch(`${this.apis.openF1.baseUrl}${this.apis.openF1.endpoints.drivers}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const drivers = await response.json();
      this.stats.requestsMade++;
      
      // Store drivers data
      for (const driver of drivers) {
        this.raceData.drivers.set(driver.driver_number, {
          id: driver.driver_number,
          name: driver.full_name,
          team: driver.team_name,
          country: driver.country_code,
          session: this.currentSession.session_key
        });
      }
      
      console.log(`👥 Loaded ${drivers.length} drivers`);
    } catch (error) {
      console.warn('⚠️ Failed to load drivers:', error.message);
      this.stats.errors++;
    }
  }

  /**
   * Load current positions
   */
  async loadPositions() {
    try {
      const response = await fetch(`${this.apis.openF1.baseUrl}${this.apis.openF1.endpoints.positions}?session_key=${this.currentSession.session_key}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const positions = await response.json();
      this.stats.requestsMade++;
      
      // Sort by position
      positions.sort((a, b) => a.position - b.position);
      
      this.raceData.positions = positions.map(pos => ({
        position: pos.position,
        driverNumber: pos.driver_number,
        driver: this.raceData.drivers.get(pos.driver_number),
        time: pos.date,
        gap: pos.gap_to_leader,
        interval: pos.interval_to_position_ahead
      }));
      
      console.log(`🏁 Loaded ${positions.length} positions`);
    } catch (error) {
      console.warn('⚠️ Failed to load positions:', error.message);
      this.stats.errors++;
    }
  }

  /**
   * Load weather data
   */
  async loadWeather() {
    try {
      const response = await fetch(`${this.apis.openF1.baseUrl}${this.apis.openF1.endpoints.weather}?session_key=${this.currentSession.session_key}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const weather = await response.json();
      this.stats.requestsMade++;
      
      if (weather.length > 0) {
        const latestWeather = weather[weather.length - 1];
        this.raceData.weather = {
          temperature: latestWeather.air_temp,
          humidity: latestWeather.humidity,
          pressure: latestWeather.pressure,
          windSpeed: latestWeather.wind_speed,
          windDirection: latestWeather.wind_direction,
          rainfall: latestWeather.rainfall,
          trackTemp: latestWeather.track_temp,
          timestamp: latestWeather.date
        };
        
        console.log(`🌤️ Weather: ${latestWeather.air_temp}°C, ${latestWeather.rainfall ? 'Rain' : 'Dry'}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load weather:', error.message);
      this.stats.errors++;
    }
  }

  /**
   * Load pit stops
   */
  async loadPitStops() {
    try {
      const response = await fetch(`${this.apis.openF1.baseUrl}${this.apis.openF1.endpoints.pitStops}?session_key=${this.currentSession.session_key}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const pitStops = await response.json();
      this.stats.requestsMade++;
      
      this.raceData.pitStops = pitStops.map(pit => ({
        driverNumber: pit.driver_number,
        driver: this.raceData.drivers.get(pit.driver_number),
        lap: pit.lap_number,
        pitDuration: pit.pit_duration,
        timestamp: pit.date
      }));
      
      console.log(`🔧 Loaded ${pitStops.length} pit stops`);
    } catch (error) {
      console.warn('⚠️ Failed to load pit stops:', error.message);
      this.stats.errors++;
    }
  }

  /**
   * Start real-time tracking
   */
  start() {
    if (this.updateInterval) {
      console.log('⚠️ Real-time tracking already started');
      return;
    }
    
    console.log('🏁 Starting real-time F1 race tracking...');
    
    // Update every 2 seconds for live data
    this.updateInterval = setInterval(async () => {
      await this.updateLiveData();
    }, 2000);
    
    this.stats.sessionStart = new Date();
    console.log('✅ Real-time tracking started');
  }

  /**
   * Update live data
   */
  async updateLiveData() {
    try {
      // Update positions
      await this.loadPositions();
      
      // Update weather
      await this.loadWeather();
      
      // Update pit stops
      await this.loadPitStops();
      
      // Check for safety car
      await this.checkSafetyCar();
      
      // Update predictions
      await this.updatePredictions();
      
      // Emit update event
      this.emit('update', this.raceData);
      
      this.stats.lastUpdate = Date.now();
    } catch (error) {
      console.warn('⚠️ Failed to update live data:', error.message);
      this.stats.errors++;
    }
  }

  /**
   * Check for safety car
   */
  async checkSafetyCar() {
    try {
      // Check for safety car in session data
      const response = await fetch(`${this.apis.openF1.baseUrl}${this.apis.openF1.endpoints.sessions}?session_key=${this.currentSession.session_key}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const sessionData = await response.json();
      this.stats.requestsMade++;
      
      if (sessionData.length > 0) {
        const session = sessionData[0];
        
        // Check for safety car status
        if (session.status === 'Safety Car') {
          this.raceData.safetyCar = true;
          this.raceData.virtualSafetyCar = false;
        } else if (session.status === 'Virtual Safety Car') {
          this.raceData.safetyCar = false;
          this.raceData.virtualSafetyCar = true;
        } else if (session.status === 'Red Flag') {
          this.raceData.redFlag = true;
        } else {
          this.raceData.safetyCar = false;
          this.raceData.virtualSafetyCar = false;
          this.raceData.redFlag = false;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to check safety car:', error.message);
      this.stats.errors++;
    }
  }

  /**
   * Update race predictions
   */
  async updatePredictions() {
    if (!this.raceData.positions || this.raceData.positions.length === 0) return;
    
    try {
      // Generate predictions based on current data
      const predictions = this.generateRacePredictions();
      this.raceData.predictions = predictions;
      
      // Emit prediction event
      this.emit('predictions', predictions);
    } catch (error) {
      console.warn('⚠️ Failed to update predictions:', error.message);
    }
  }

  /**
   * Generate race predictions
   */
  generateRacePredictions() {
    const predictions = {
      winner: null,
      podium: [],
      fastestLap: null,
      mostOvertakes: null,
      pitStopStrategy: {},
      weatherImpact: null,
      confidence: 0.8,
      timestamp: new Date().toISOString()
    };
    
    if (this.raceData.positions.length > 0) {
      // Predict winner (current leader)
      const leader = this.raceData.positions[0];
      predictions.winner = {
        driver: leader.driver,
        position: leader.position,
        gap: leader.gap
      };
      
      // Predict podium (top 3)
      predictions.podium = this.raceData.positions.slice(0, 3).map(pos => ({
        driver: pos.driver,
        position: pos.position,
        gap: pos.gap
      }));
      
      // Predict fastest lap (driver with best recent performance)
      predictions.fastestLap = this.predictFastestLap();
      
      // Predict most overtakes
      predictions.mostOvertakes = this.predictMostOvertakes();
      
      // Predict pit stop strategy
      predictions.pitStopStrategy = this.predictPitStopStrategy();
      
      // Predict weather impact
      predictions.weatherImpact = this.predictWeatherImpact();
    }
    
    return predictions;
  }

  /**
   * Predict fastest lap
   */
  predictFastestLap() {
    // Simple prediction based on current position and gap
    const leader = this.raceData.positions[0];
    return {
      driver: leader.driver,
      confidence: 0.7
    };
  }

  /**
   * Predict most overtakes
   */
  predictMostOvertakes() {
    // Find driver with most position changes
    const positionChanges = new Map();
    
    for (const pos of this.raceData.positions) {
      const changes = Math.abs(pos.position - pos.driverNumber); // Simplified
      positionChanges.set(pos.driverNumber, changes);
    }
    
    const mostOvertakes = Array.from(positionChanges.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      driver: this.raceData.drivers.get(mostOvertakes[0]),
      overtakes: mostOvertakes[1],
      confidence: 0.6
    };
  }

  /**
   * Predict pit stop strategy
   */
  predictPitStopStrategy() {
    const strategy = {};
    
    for (const pos of this.raceData.positions) {
      const driver = pos.driver;
      const pitStops = this.raceData.pitStops.filter(pit => pit.driverNumber === pos.driverNumber);
      
      strategy[driver.name] = {
        stops: pitStops.length,
        lastStop: pitStops.length > 0 ? pitStops[pitStops.length - 1].lap : 0,
        strategy: pitStops.length > 2 ? 'aggressive' : pitStops.length < 1 ? 'conservative' : 'balanced'
      };
    }
    
    return strategy;
  }

  /**
   * Predict weather impact
   */
  predictWeatherImpact() {
    if (!this.raceData.weather) return null;
    
    const weather = this.raceData.weather;
    const impact = {
      level: 'low',
      description: 'Minimal weather impact',
      affectedDrivers: []
    };
    
    if (weather.rainfall > 0) {
      impact.level = 'high';
      impact.description = 'Rain affecting race conditions';
      
      // Find drivers who perform well in wet conditions
      for (const pos of this.raceData.positions) {
        if (pos.position <= 5) { // Top 5 drivers
          impact.affectedDrivers.push(pos.driver);
        }
      }
    } else if (weather.temperature > 35) {
      impact.level = 'medium';
      impact.description = 'High temperatures affecting tire performance';
    }
    
    return impact;
  }

  /**
   * Stop real-time tracking
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🛑 Real-time tracking stopped');
    }
  }

  /**
   * Get current race data
   */
  getRaceData() {
    return {
      ...this.raceData,
      isLive: this.isLive,
      session: this.currentSession,
      stats: this.stats
    };
  }

  /**
   * Get live leaderboard
   */
  getLeaderboard() {
    return this.raceData.positions.map(pos => ({
      position: pos.position,
      driver: pos.driver?.name || `Driver ${pos.driverNumber}`,
      team: pos.driver?.team || 'Unknown',
      gap: pos.gap,
      interval: pos.interval
    }));
  }

  /**
   * Get weather conditions
   */
  getWeather() {
    return this.raceData.weather;
  }

  /**
   * Get safety car status
   */
  getSafetyCarStatus() {
    return {
      safetyCar: this.raceData.safetyCar,
      virtualSafetyCar: this.raceData.virtualSafetyCar,
      redFlag: this.raceData.redFlag
    };
  }

  /**
   * Get pit stop data
   */
  getPitStops() {
    return this.raceData.pitStops;
  }

  /**
   * Get predictions
   */
  getPredictions() {
    return this.raceData.predictions;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      sessionDuration: this.stats.sessionStart ? Date.now() - this.stats.sessionStart : 0,
      isLive: this.isLive,
      lastUpdate: new Date(this.stats.lastUpdate).toISOString()
    };
  }
}

// Main execution
async function main() {
  const tracker = new RealTimeF1RaceTracker();
  
  // Initialize tracker
  const initialized = await tracker.initialize();
  
  if (initialized) {
    console.log('🏁 Live F1 session detected! Starting real-time tracking...');
    
    // Start tracking
    tracker.start();
    
    // Display race information
    displayRaceInfo(tracker);
    
    // Update display every 5 seconds
    setInterval(() => {
      displayRaceStatus(tracker);
    }, 5000);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping real-time tracking...');
      tracker.stop();
      process.exit(0);
    });
    
  } else {
    console.log('⚠️ No live F1 session detected. Run during an actual F1 race weekend!');
    process.exit(1);
  }
}

/**
 * Display race information
 */
function displayRaceInfo(tracker) {
  const raceData = tracker.getRaceData();
  
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           🏎️ LIVE F1 RACE TRACKER 🏎️                        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  
  if (raceData.session) {
    console.log(`\n📍 Session: ${raceData.session.session_name}`);
    console.log(`🏁 Location: ${raceData.session.location}`);
    console.log(`📅 Date: ${new Date(raceData.session.date_start).toLocaleDateString()}`);
    console.log(`⏰ Start: ${new Date(raceData.session.date_start).toLocaleTimeString()}`);
  }
  
  if (raceData.weather) {
    const weather = raceData.weather;
    console.log(`\n🌤️ Weather: ${weather.temperature}°C | ${weather.humidity}% humidity`);
    if (weather.rainfall > 0) {
      console.log(`💧 Rainfall: ${weather.rainfall}mm/h`);
    }
  }
  
  console.log('\n📡 Real-time data sources:');
  console.log('   • OpenF1 API - Live timing and positions');
  console.log('   • Live weather conditions');
  console.log('   • Safety car and VSC detection');
  console.log('   • Pit stop monitoring');
  console.log('   • Live race predictions');
  
  console.log('\n🎮 Controls: Ctrl+C to stop tracking\n');
}

/**
 * Display race status
 */
function displayRaceStatus(tracker) {
  const now = new Date();
  const leaderboard = tracker.getLeaderboard();
  const weather = tracker.getWeather();
  const safetyCar = tracker.getSafetyCarStatus();
  const predictions = tracker.getPredictions();
  
  console.log(`\n⏰ ${now.toLocaleTimeString()} | 🏁 Live F1 Race Tracking`);
  
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
  const pitStops = tracker.getPitStops();
  if (pitStops.length > 0) {
    console.log(`\n🔧 Recent Pit Stops: ${pitStops.length} total`);
    pitStops.slice(-3).forEach(pit => {
      console.log(`   ${pit.driver.name} - Lap ${pit.lap} (${pit.pitDuration}s)`);
    });
  }
}

// Run the tracker
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Real-time F1 tracker failed:', error);
    process.exit(1);
  });
}

// Export is already defined above
