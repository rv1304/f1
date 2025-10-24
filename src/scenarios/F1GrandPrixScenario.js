/**
 * VelocityForge F1 Grand Prix Scenario
 * 
 * Complete F1 race scenario with real data integration,
 * advanced prediction, and comprehensive simulation.
 * Inspired by mehmetkahya0/f1-race-prediction approach.
 */

import { F1DataIntegration } from '../integration/F1DataIntegration.js';
import { RealTimeF1Integration } from '../integration/RealTimeF1Integration.js';
import { RealTimeWeatherIntegration } from '../integration/RealTimeWeatherIntegration.js';
import { RacePredictionSystem } from '../prediction/RacePredictionSystem.js';
import { WeatherSystem } from '../systems/WeatherSystem.js';
import { F1Agent } from '../agents/F1Agent.js';
import { getTrack } from '../data/F1Tracks.js';
import { getDriver } from '../data/RealF1Drivers.js';
import { Vector3 } from '../utils/Vector3.js';

export class F1GrandPrixScenario {
  constructor() {
    this.dataIntegration = new F1DataIntegration();
    this.realTimeIntegration = new RealTimeF1Integration();
    this.weatherIntegration = new RealTimeWeatherIntegration();
    this.predictionSystem = new RacePredictionSystem(this.dataIntegration);
    this.weatherSystem = new WeatherSystem();
    
    this.scenario = null;
    this.agents = [];
    this.isInitialized = false;
    
    // Race configuration
    this.raceConfig = {
      trackId: 'monaco',
      sessionType: 'race',
      raceLength: 78, // laps
      maxDuration: 7200, // 2 hours in seconds
      enableSafetyCar: true,
      enableVirtualSafetyCar: true,
      enableRedFlag: true,
      enableWeatherChanges: true,
      realTimeData: true,
      livePredictions: true
    };
    
    // Real-time race data
    this.raceData = {
      currentLap: 0,
      sessionTime: 0,
      safetyCarDeployed: false,
      virtualSafetyCar: false,
      redFlag: false,
      weatherChanged: false,
      incidents: [],
      overtakes: [],
      pitStops: [],
      leaderboard: [],
      predictions: null
    };
  }

  /**
   * Initialize the F1 Grand Prix scenario
   */
  async initialize(config = {}) {
    console.log('🏁 Initializing F1 Grand Prix scenario...');
    
    try {
      // Merge configuration
      this.raceConfig = { ...this.raceConfig, ...config };
      
      // Initialize real-time data integrations
      if (this.raceConfig.realTimeData) {
        console.log('🔗 Initializing real-time F1 data integration...');
        await this.realTimeIntegration.initialize();
        
        console.log('🌤️ Initializing real-time weather integration...');
        await this.weatherIntegration.initialize();
      }
      
      // Initialize data integration
      await this.dataIntegration.initialize();
      
      // Initialize weather system
      this.weatherSystem.start();
      
      // Create scenario
      this.scenario = await this.createScenario();
      
      // Generate race predictions
      await this.generatePredictions();
      
      this.isInitialized = true;
      console.log('✅ F1 Grand Prix scenario initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize F1 Grand Prix scenario:', error);
      return false;
    }
  }

  /**
   * Create the complete F1 scenario
   */
  async createScenario() {
    const track = getTrack(this.raceConfig.trackId);
    if (!track) {
      throw new Error(`Track ${this.raceConfig.trackId} not found`);
    }
    
    // Get current weather
    const weather = this.weatherSystem.getCurrentWeather();
    
    // Create F1 grid (top 20 drivers)
    const drivers = await this.createF1Grid();
    
    return {
      name: `${track.name} Grand Prix`,
      description: `F1 Grand Prix at ${track.name}`,
      track: track,
      weather: weather,
      drivers: drivers,
      
      // World bounds based on track
      bounds: {
        min: new Vector3(-track.length * 50, -10, -track.length * 50),
        max: new Vector3(track.length * 50, 10, track.length * 50)
      },
      
      // Race-specific settings
      settings: {
        maxDuration: this.raceConfig.maxDuration,
        enableCollisions: true,
        enableIncidents: true,
        incidentProbability: 0.02,
        weatherEffects: this.raceConfig.enableWeatherChanges,
        safetyCar: this.raceConfig.enableSafetyCar,
        virtualSafetyCar: this.raceConfig.enableVirtualSafetyCar,
        redFlag: this.raceConfig.enableRedFlag
      }
    };
  }

  /**
   * Create F1 grid with real driver data
   */
  async createF1Grid() {
    const drivers = [
      { id: 'max_verstappen', carId: 'red_bull_rb20', team: 'Red Bull Racing', gridPosition: 1 },
      { id: 'charles_leclerc', carId: 'ferrari_sf24', team: 'Ferrari', gridPosition: 2 },
      { id: 'lewis_hamilton', carId: 'mercedes_w15', team: 'Mercedes', gridPosition: 3 },
      { id: 'lando_norris', carId: 'mclaren_mcl38', team: 'McLaren', gridPosition: 4 },
      { id: 'george_russell', carId: 'mercedes_w15', team: 'Mercedes', gridPosition: 5 },
      { id: 'carlos_sainz', carId: 'ferrari_sf24', team: 'Ferrari', gridPosition: 6 },
      { id: 'oscar_piastri', carId: 'mclaren_mcl38', team: 'McLaren', gridPosition: 7 },
      { id: 'fernando_alonso', carId: 'ferrari_sf24', team: 'Aston Martin', gridPosition: 8 },
      { id: 'sergio_perez', carId: 'red_bull_rb20', team: 'Red Bull Racing', gridPosition: 9 },
      { id: 'valtteri_bottas', carId: 'mercedes_w15', team: 'Sauber', gridPosition: 10 }
    ];
    
    // Create F1 agents
    this.agents = [];
    
    for (const driverConfig of drivers) {
      try {
        const agent = new F1Agent(driverConfig);
        
        // Set track and weather system
        agent.setTrack(this.raceConfig.trackId);
        agent.setWeatherSystem(this.weatherSystem);
        
        // Set grid position
        agent.f1Metrics.gridPosition = driverConfig.gridPosition;
        agent.f1Metrics.position = driverConfig.gridPosition;
        
        this.agents.push(agent);
      } catch (error) {
        console.warn(`⚠️ Failed to create agent for ${driverConfig.id}:`, error.message);
      }
    }
    
    return drivers;
  }

  /**
   * Generate race predictions
   */
  async generatePredictions() {
    console.log('🔮 Generating race predictions...');
    
    const weather = this.weatherSystem.getCurrentWeather();
    
    const predictionConfig = {
      drivers: this.scenario.drivers,
      trackId: this.raceConfig.trackId,
      weatherConditions: weather,
      raceLength: this.raceConfig.raceLength,
      sessionType: this.raceConfig.sessionType
    };
    
    this.raceData.predictions = await this.predictionSystem.predictRaceOutcome(predictionConfig);
    
    console.log('✅ Race predictions generated');
    console.log(`🏆 Predicted winner: ${this.raceData.predictions.predictions[0].driverName}`);
    console.log(`📊 Prediction confidence: ${(this.raceData.predictions.confidence * 100).toFixed(1)}%`);
  }

  /**
   * Start the F1 Grand Prix
   */
  start() {
    if (!this.isInitialized) {
      throw new Error('F1 Grand Prix scenario not initialized');
    }
    
    console.log('🏁 Starting F1 Grand Prix!');
    console.log(`📍 Track: ${this.scenario.track.name}`);
    console.log(`🌤️ Weather: ${this.scenario.weather.temperature}°C, ${this.scenario.weather.precipitation > 0 ? 'Wet' : 'Dry'}`);
    console.log(`👥 Grid: ${this.agents.length} drivers`);
    
    // Start race session
    this.raceData.sessionTime = 0;
    this.raceData.currentLap = 0;
    
    // Emit race start event
    this.emitEvent('f1:raceStarted', {
      track: this.scenario.track,
      weather: this.scenario.weather,
      grid: this.agents.map(agent => ({
        position: agent.f1Metrics.gridPosition,
        driver: agent.driverData?.name || agent.name || 'Unknown Driver',
        team: agent.driverData?.team || 'Unknown Team'
      })),
      predictions: this.raceData.predictions
    });
    
    return true;
  }

  /**
   * Update race progress
   */
  update(deltaTime) {
    if (!this.isInitialized) return;
    
    this.raceData.sessionTime += deltaTime;
    
    // Update weather
    if (this.raceConfig.enableWeatherChanges) {
      this.weatherSystem.updateWeather();
    }
    
    // Update agents
    for (const agent of this.agents) {
      agent.update(deltaTime, this.raceData.sessionTime);
    }
    
    // Check for race events
    this.checkRaceEvents();
    
    // Update leaderboard
    this.updateLeaderboard();
    
    // Check for lap completion
    this.checkLapCompletion();
    
    // Check for race end
    this.checkRaceEnd();
  }

  /**
   * Check for race events (safety car, incidents, etc.)
   */
  checkRaceEvents() {
    // Safety car probability
    if (this.raceConfig.enableSafetyCar && !this.raceData.safetyCarDeployed) {
      const trackData = this.scenario.track;
      const safetyCarProbability = trackData.characteristics.safetyCarProbability;
      
      if (Math.random() < safetyCarProbability * 0.001) { // Scale down for real-time
        this.deploySafetyCar();
      }
    }
    
    // Weather changes
    if (this.raceConfig.enableWeatherChanges) {
      const currentWeather = this.weatherSystem.getCurrentWeather();
      if (currentWeather.precipitation !== this.scenario.weather.precipitation) {
        this.handleWeatherChange(currentWeather);
      }
    }
  }

  /**
   * Deploy safety car
   */
  deploySafetyCar() {
    this.raceData.safetyCarDeployed = true;
    this.raceData.virtualSafetyCar = false;
    
    console.log('🚨 Safety Car Deployed!');
    
    // Emit safety car event
    this.emitEvent('f1:safetyCarDeployed', {
      lap: this.raceData.currentLap,
      sessionTime: this.raceData.sessionTime
    });
    
    // Set safety car for all agents
    for (const agent of this.agents) {
      agent.f1State.underSafetyCar = true;
    }
  }

  /**
   * Handle weather change
   */
  handleWeatherChange(newWeather) {
    this.scenario.weather = newWeather;
    this.raceData.weatherChanged = true;
    
    console.log(`🌧️ Weather changed: ${newWeather.precipitation > 0 ? 'Rain started' : 'Rain stopped'}`);
    
    // Emit weather change event
    this.emitEvent('f1:weatherChanged', {
      weather: newWeather,
      lap: this.raceData.currentLap,
      sessionTime: this.raceData.sessionTime
    });
    
    // Update all agents
    for (const agent of this.agents) {
      agent.setWeatherSystem(this.weatherSystem);
    }
  }

  /**
   * Update leaderboard
   */
  updateLeaderboard() {
    // Sort agents by position (distance traveled)
    const sortedAgents = [...this.agents].sort((a, b) => 
      b.f1Metrics.totalDistance - a.f1Metrics.totalDistance
    );
    
    // Update positions
    sortedAgents.forEach((agent, index) => {
      const newPosition = index + 1;
      if (agent.f1Metrics.position !== newPosition) {
        const oldPosition = agent.f1Metrics.position;
        agent.f1Metrics.position = newPosition;
        
        // Track position changes
        if (newPosition < oldPosition) {
          agent.f1Metrics.positionsGained++;
        } else if (newPosition > oldPosition) {
          agent.f1Metrics.positionsLost++;
        }
        
        // Emit position change event
        this.emitEvent('f1:positionChanged', {
          driver: agent.driverData?.name || agent.name || 'Unknown Driver',
          oldPosition,
          newPosition,
          lap: this.raceData.currentLap
        });
      }
    });
    
    this.raceData.leaderboard = sortedAgents.map(agent => ({
      position: agent.f1Metrics.position,
      driver: agent.driverData?.name || agent.name || 'Unknown Driver',
      team: agent.driverData?.team || 'Unknown Team',
      distance: agent.f1Metrics.totalDistance,
      lapTime: agent.f1Metrics.lapTime,
      gapToLeader: agent.f1Metrics.position === 1 ? 0 : 
        sortedAgents[0].f1Metrics.totalDistance - agent.f1Metrics.totalDistance
    }));
  }

  /**
   * Check for lap completion
   */
  checkLapCompletion() {
    for (const agent of this.agents) {
      const trackLength = this.scenario.track.length * 1000; // Convert to meters
      const lapsCompleted = Math.floor(agent.f1Metrics.totalDistance / trackLength);
      
      if (lapsCompleted > agent.f1Metrics.totalLaps) {
        agent.completeLap();
        
        // Emit lap complete event
        this.emitEvent('f1:lapComplete', {
          driver: agent.driverData?.name || agent.name || 'Unknown Driver',
          lap: lapsCompleted,
          lapTime: agent.f1Metrics.lapTime,
          position: agent.f1Metrics.position
        });
        
        // Update current lap
        this.raceData.currentLap = Math.max(this.raceData.currentLap, lapsCompleted);
      }
    }
  }

  /**
   * Check for race end
   */
  checkRaceEnd() {
    const raceEnded = 
      this.raceData.currentLap >= this.raceConfig.raceLength ||
      this.raceData.sessionTime >= this.raceConfig.maxDuration;
    
    if (raceEnded) {
      this.endRace();
    }
  }

  /**
   * End the race
   */
  endRace() {
    console.log('🏁 Race Finished!');
    
    // Calculate final results
    const finalResults = this.calculateFinalResults();
    
    // Emit race end event
    this.emitEvent('f1:raceFinished', {
      results: finalResults,
      totalLaps: this.raceData.currentLap,
      sessionTime: this.raceData.sessionTime,
      weather: this.scenario.weather,
      incidents: this.raceData.incidents,
      predictions: this.raceData.predictions
    });
    
    // Display results
    this.displayResults(finalResults);
  }

  /**
   * Calculate final race results
   */
  calculateFinalResults() {
    const sortedAgents = [...this.agents].sort((a, b) => 
      b.f1Metrics.totalDistance - a.f1Metrics.totalDistance
    );
    
    return sortedAgents.map((agent, index) => ({
      position: index + 1,
      driver: agent.driverData.name,
      team: agent.driverData.team,
      gridPosition: agent.f1Metrics.gridPosition,
      positionChange: agent.f1Metrics.gridPosition - (index + 1),
      totalDistance: agent.f1Metrics.totalDistance,
      totalLaps: agent.f1Metrics.totalLaps,
      bestLapTime: agent.f1Metrics.bestLapTime,
      points: this.calculatePoints(index + 1),
      pitStops: agent.f1Metrics.pitStops,
      incidents: agent.f1Metrics.incidents,
      overtakes: agent.f1Metrics.overtakes,
      positionsGained: agent.f1Metrics.positionsGained,
      positionsLost: agent.f1Metrics.positionsLost
    }));
  }

  /**
   * Calculate points based on position
   */
  calculatePoints(position) {
    const pointsSystem = {
      1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
      6: 8, 7: 6, 8: 4, 9: 2, 10: 1
    };
    
    return pointsSystem[position] || 0;
  }

  /**
   * Display race results
   */
  displayResults(results) {
    console.log('\n🏆 FINAL RACE RESULTS');
    console.log('='.repeat(80));
    console.log('| Pos | Driver           | Team           | Start | Change | Points |');
    console.log('|-----|------------------|----------------|-------|--------|--------|');
    
    results.forEach(result => {
      const position = result.position.toString().padStart(3);
      const driver = result.driver.padEnd(15);
      const team = result.team.padEnd(14);
      const start = result.gridPosition.toString().padStart(5);
      const change = result.positionChange > 0 ? `+${result.positionChange}` : 
                    result.positionChange < 0 ? `${result.positionChange}` : '→';
      const changeStr = change.padStart(6);
      const points = result.points.toString().padStart(6);
      
      console.log(`| ${position} | ${driver} | ${team} | ${start} | ${changeStr} | ${points} |`);
    });
    
    console.log('='.repeat(80));
    
    // Show prediction accuracy
    if (this.raceData.predictions) {
      const predictedWinner = this.raceData.predictions.predictions[0];
      const actualWinner = results[0];
      
      console.log(`\n🔮 PREDICTION ACCURACY:`);
      console.log(`Predicted Winner: ${predictedWinner.driverName}`);
      console.log(`Actual Winner: ${actualWinner.driver}`);
      console.log(`Prediction Correct: ${predictedWinner.driverName === actualWinner.driver ? '✅' : '❌'}`);
    }
  }

  /**
   * Get current race status
   */
  getRaceStatus() {
    return {
      currentLap: this.raceData.currentLap,
      sessionTime: this.raceData.sessionTime,
      leaderboard: this.raceData.leaderboard,
      weather: this.scenario.weather,
      safetyCar: this.raceData.safetyCarDeployed,
      virtualSafetyCar: this.raceData.virtualSafetyCar,
      redFlag: this.raceData.redFlag,
      incidents: this.raceData.incidents.length,
      predictions: this.raceData.predictions
    };
  }

  /**
   * Get agent telemetry
   */
  getAgentTelemetry(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    return agent ? agent.getTelemetry() : null;
  }

  /**
   * Get all agents telemetry
   */
  getAllTelemetry() {
    return this.agents.map(agent => agent.getTelemetry());
  }

  /**
   * Emit event (placeholder)
   */
  emitEvent(eventType, data) {
    // This would be connected to the event bus
    console.log(`📡 Event: ${eventType}`, data);
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.weatherSystem.stop();
    this.agents.forEach(agent => agent.destroy());
    this.agents = [];
    this.isInitialized = false;
  }
}
