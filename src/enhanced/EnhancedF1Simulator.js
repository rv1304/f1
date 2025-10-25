/**
 * Enhanced F1 Simulator with Advanced Analytics
 * 
 * Extended version of the real F1 simulator with:
 * - Advanced telemetry data
 * - Sector timing
 * - Tire strategies
 * - Performance analytics
 * - Better event generation
 */

import { RealF1Simulator } from '../../real-f1-simulator.js';
import { EventEmitter } from 'events';

class EnhancedF1Simulator extends RealF1Simulator {
  constructor() {
    super();
    
    // Enhanced analytics data
    this.telemetryData = new Map();
    this.sectorTimes = new Map();
    this.tireStrategies = new Map();
    this.performanceMetrics = new Map();
    this.raceEvents = [];
    
    // Track sectors (3 sectors per lap)
    this.sectors = [
      { id: 1, name: 'Sector 1', start: 0, end: 33 },
      { id: 2, name: 'Sector 2', start: 33, end: 66 },
      { id: 3, name: 'Sector 3', start: 66, end: 100 }
    ];
    
    // Enhanced update frequency for better analytics
    this.analyticsUpdateInterval = 100; // ms
  }

  /**
   * Initialize enhanced simulator
   */
  async initialize(trackId = 'monaco') {
    const result = super.initialize(trackId);
    
    if (result) {
      this.initializeAnalytics();
    }
    
    return result;
  }

  /**
   * Initialize analytics systems
   */
  initializeAnalytics() {
    // Initialize telemetry for each driver
    this.drivers.forEach(driver => {
      this.telemetryData.set(driver.id, {
        driverId: driver.id,
        speed: [],
        acceleration: [],
        engineTemp: [],
        tireTemp: [],
        fuelLevel: 100,
        tireWear: 0,
        lapTimes: [],
        sectorTimes: { 1: [], 2: [], 3: [] },
        positions: []
      });
      
      // Initialize tire strategy
      this.tireStrategies.set(driver.id, {
        currentCompound: 'medium',
        lapsOnTires: 0,
        pitStops: [],
        strategy: this.generateTireStrategy()
      });
      
      // Initialize performance metrics
      this.performanceMetrics.set(driver.id, {
        consistency: Math.random() * 0.3 + 0.7, // 0.7-1.0
        aggressiveness: Math.random() * 0.5 + 0.3, // 0.3-0.8
        skillLevel: Math.random() * 0.4 + 0.6, // 0.6-1.0
        riskTaking: Math.random() * 0.6 + 0.2 // 0.2-0.8
      });
    });
  }

  /**
   * Generate realistic tire strategy
   */
  generateTireStrategy() {
    const strategies = [
      { name: 'One-Stop', stops: [{ lap: 25, compound: 'hard' }] },
      { name: 'Two-Stop', stops: [{ lap: 18, compound: 'medium' }, { lap: 35, compound: 'soft' }] },
      { name: 'Aggressive', stops: [{ lap: 15, compound: 'soft' }, { lap: 30, compound: 'medium' }] },
      { name: 'Conservative', stops: [{ lap: 30, compound: 'hard' }] }
    ];
    
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  /**
   * Enhanced update method with analytics
   */
  update() {
    super.update();
    
    // Update analytics for each driver
    this.drivers.forEach(driver => {
      this.updateDriverTelemetry(driver);
      this.updateSectorTiming(driver);
      this.updateTireStrategy(driver);
      this.checkPerformanceEvents(driver);
    });
    
    // Update race analytics
    this.updateRaceAnalytics();
  }

  /**
   * Update driver telemetry data
   */
  updateDriverTelemetry(driver) {
    const telemetry = this.telemetryData.get(driver.id);
    if (!telemetry) return;
    
    const now = Date.now();
    const metrics = this.performanceMetrics.get(driver.id);
    
    // Calculate realistic values based on track position and driver skill
    const baseSpeed = 280 + (metrics.skillLevel * 40);
    const speedVariation = (1 - metrics.consistency) * 30;
    const currentSpeed = Math.max(200, 
      baseSpeed + 
      (Math.sin(now / 1000) * speedVariation) + 
      (Math.random() * 10 - 5)
    );
    
    const acceleration = (currentSpeed - (telemetry.speed[telemetry.speed.length - 1] || currentSpeed)) / 0.1;
    const engineTemp = 85 + Math.random() * 15 + (currentSpeed / 280) * 10;
    const tireTemp = 80 + Math.random() * 20 + (currentSpeed / 280) * 15;
    
    // Update telemetry arrays (keep last 100 points)
    telemetry.speed.push(currentSpeed);
    if (telemetry.speed.length > 100) telemetry.speed.shift();
    
    telemetry.acceleration.push(acceleration);
    if (telemetry.acceleration.length > 100) telemetry.acceleration.shift();
    
    telemetry.engineTemp.push(engineTemp);
    if (telemetry.engineTemp.length > 100) telemetry.engineTemp.shift();
    
    telemetry.tireTemp.push(tireTemp);
    if (telemetry.tireTemp.length > 100) telemetry.tireTemp.shift();
    
    // Update fuel consumption
    telemetry.fuelLevel = Math.max(0, telemetry.fuelLevel - 0.001);
    
    // Update tire wear
    const strategy = this.tireStrategies.get(driver.id);
    if (strategy) {
      const wearRate = 0.002 * (currentSpeed / 280) * (1 + metrics.aggressiveness);
      telemetry.tireWear = Math.min(100, telemetry.tireWear + wearRate);
      strategy.lapsOnTires += 0.001;
    }
    
    // Store current position
    telemetry.positions.push({
      timestamp: now,
      position: driver.position || this.drivers.indexOf(driver) + 1,
      lap: this.raceState.lap,
      sector: this.getCurrentSector(driver)
    });
    if (telemetry.positions.length > 1000) telemetry.positions.shift();
    
    // Update driver object with current telemetry
    driver.speed = currentSpeed;
    driver.acceleration = acceleration;
    driver.engineTemp = engineTemp;
    driver.tireTemp = tireTemp;
    driver.fuelLevel = telemetry.fuelLevel;
    driver.tireWear = telemetry.tireWear;
  }

  /**
   * Update sector timing
   */
  updateSectorTiming(driver) {
    const currentSector = this.getCurrentSector(driver);
    const telemetry = this.telemetryData.get(driver.id);
    
    if (!telemetry.lastSector || telemetry.lastSector !== currentSector) {
      // Entering new sector
      if (telemetry.lastSector) {
        // Completed previous sector
        const sectorTime = Date.now() - telemetry.sectorStartTime;
        telemetry.sectorTimes[telemetry.lastSector].push(sectorTime);
        
        // Emit sector event
        this.emit('sector_complete', {
          driver: driver.name,
          sector: telemetry.lastSector,
          time: sectorTime,
          lap: this.raceState.lap
        });
      }
      
      telemetry.lastSector = currentSector;
      telemetry.sectorStartTime = Date.now();
    }
  }

  /**
   * Get current sector for driver
   */
  getCurrentSector(driver) {
    const progress = driver.progress || 0;
    
    for (const sector of this.sectors) {
      if (progress >= sector.start && progress < sector.end) {
        return sector.id;
      }
    }
    
    return 3; // Default to sector 3
  }

  /**
   * Update tire strategy
   */
  updateTireStrategy(driver) {
    const strategy = this.tireStrategies.get(driver.id);
    if (!strategy) return;
    
    const currentLap = this.raceState.lap;
    
    // Check if pit stop is due
    for (const stop of strategy.strategy.stops) {
      if (currentLap >= stop.lap && !stop.completed) {
        this.executePitStop(driver, stop);
        stop.completed = true;
        break;
      }
    }
    
    // Check for emergency pit stop (high tire wear or low fuel)
    const telemetry = this.telemetryData.get(driver.id);
    if (telemetry.tireWear > 80 || telemetry.fuelLevel < 10) {
      this.executeEmergencyPitStop(driver);
    }
  }

  /**
   * Execute pit stop
   */
  executePitStop(driver, stop) {
    const strategy = this.tireStrategies.get(driver.id);
    const telemetry = this.telemetryData.get(driver.id);
    
    // Reset tire wear and fuel
    telemetry.tireWear = 0;
    telemetry.fuelLevel = Math.min(100, telemetry.fuelLevel + 50);
    strategy.currentCompound = stop.compound;
    strategy.lapsOnTires = 0;
    
    // Add pit stop time penalty
    const pitTime = 22000 + Math.random() * 3000; // 22-25 seconds
    
    strategy.pitStops.push({
      lap: this.raceState.lap,
      compound: stop.compound,
      duration: pitTime,
      timestamp: Date.now()
    });
    
    // Emit pit stop event
    this.emit('pit_stop', {
      driver: driver.name,
      lap: this.raceState.lap,
      compound: stop.compound,
      duration: pitTime
    });
    
    this.raceEvents.push({
      type: 'pit_stop',
      driver: driver.name,
      lap: this.raceState.lap,
      compound: stop.compound,
      duration: pitTime,
      timestamp: Date.now()
    });
  }

  /**
   * Execute emergency pit stop
   */
  executeEmergencyPitStop(driver) {
    if (Math.random() < 0.1) { // 10% chance per update
      this.executePitStop(driver, {
        compound: 'medium',
        lap: this.raceState.lap
      });
    }
  }

  /**
   * Check for performance-based events
   */
  checkPerformanceEvents(driver) {
    const metrics = this.performanceMetrics.get(driver.id);
    const telemetry = this.telemetryData.get(driver.id);
    
    // Speed boost event (based on skill and risk-taking)
    if (Math.random() < metrics.skillLevel * metrics.riskTaking * 0.001) {
      this.triggerSpeedBoost(driver);
    }
    
    // Mistake/incident (based on consistency and aggressiveness)
    if (Math.random() < (1 - metrics.consistency) * metrics.aggressiveness * 0.0005) {
      this.triggerIncident(driver);
    }
    
    // Overtake attempt (based on aggressiveness and current position)
    if (Math.random() < metrics.aggressiveness * 0.002) {
      this.attemptOvertake(driver);
    }
  }

  /**
   * Trigger speed boost
   */
  triggerSpeedBoost(driver) {
    const telemetry = this.telemetryData.get(driver.id);
    
    // Boost speed for next few seconds
    setTimeout(() => {
      if (telemetry.speed.length > 0) {
        for (let i = 0; i < 10; i++) {
          if (telemetry.speed.length > 0) {
            telemetry.speed[telemetry.speed.length - 1] += 15;
          }
        }
      }
    }, 100);
    
    this.emit('speed_boost', {
      driver: driver.name,
      lap: this.raceState.lap,
      boost: 15
    });
    
    this.raceEvents.push({
      type: 'speed_boost',
      driver: driver.name,
      lap: this.raceState.lap,
      boost: 15,
      timestamp: Date.now()
    });
  }

  /**
   * Trigger incident
   */
  triggerIncident(driver) {
    const telemetry = this.telemetryData.get(driver.id);
    
    // Reduce speed temporarily
    setTimeout(() => {
      if (telemetry.speed.length > 0) {
        for (let i = 0; i < 20; i++) {
          if (telemetry.speed.length > 0) {
            telemetry.speed[telemetry.speed.length - 1] = Math.max(100, 
              telemetry.speed[telemetry.speed.length - 1] - 10);
          }
        }
      }
    }, 100);
    
    this.emit('incident', {
      driver: driver.name,
      lap: this.raceState.lap,
      type: 'mistake'
    });
    
    this.raceEvents.push({
      type: 'incident',
      driver: driver.name,
      lap: this.raceState.lap,
      incident: 'mistake',
      timestamp: Date.now()
    });
  }

  /**
   * Attempt overtake
   */
  attemptOvertake(driver) {
    // Find driver ahead
    const currentPosition = driver.position || this.drivers.indexOf(driver) + 1;
    const targetDriver = this.drivers.find(d => (d.position || this.drivers.indexOf(d) + 1) === currentPosition - 1);
    
    if (targetDriver && Math.random() < 0.3) { // 30% success rate
      // Successful overtake
      this.emit('overtake', {
        driver: driver.name,
        overtaken: targetDriver.name,
        lap: this.raceState.lap,
        newPosition: currentPosition - 1
      });
      
      this.raceEvents.push({
        type: 'overtake',
        driver: driver.name,
        overtaken: targetDriver.name,
        lap: this.raceState.lap,
        newPosition: currentPosition - 1,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Update race analytics
   */
  updateRaceAnalytics() {
    // Update race state with analytics
    this.raceState.analytics = {
      averageSpeed: this.calculateAverageSpeed(),
      fastestLap: this.getFastestLap(),
      totalOvertakes: this.raceEvents.filter(e => e.type === 'overtake').length,
      totalIncidents: this.raceEvents.filter(e => e.type === 'incident').length,
      totalPitStops: this.raceEvents.filter(e => e.type === 'pit_stop').length,
      leaderGap: this.calculateLeaderGap()
    };
  }

  /**
   * Calculate average speed across all drivers
   */
  calculateAverageSpeed() {
    let totalSpeed = 0;
    let count = 0;
    
    this.telemetryData.forEach(telemetry => {
      if (telemetry.speed.length > 0) {
        totalSpeed += telemetry.speed[telemetry.speed.length - 1];
        count++;
      }
    });
    
    return count > 0 ? totalSpeed / count : 0;
  }

  /**
   * Get fastest lap time
   */
  getFastestLap() {
    let fastestTime = Infinity;
    let fastestDriver = null;
    
    this.telemetryData.forEach((telemetry, driverId) => {
      telemetry.lapTimes.forEach(lapTime => {
        if (lapTime < fastestTime) {
          fastestTime = lapTime;
          fastestDriver = this.drivers.find(d => d.id === driverId);
        }
      });
    });
    
    return {
      time: fastestTime === Infinity ? null : fastestTime,
      driver: fastestDriver?.name || null
    };
  }

  /**
   * Calculate gap to leader
   */
  calculateLeaderGap() {
    if (this.drivers.length < 2) return 0;
    
    const leader = this.drivers[0];
    const second = this.drivers[1];
    
    return (second.totalTime || 0) - (leader.totalTime || 0);
  }

  /**
   * Get enhanced status with analytics
   */
  getStatus() {
    const baseStatus = super.getStatus();
    
    return {
      ...baseStatus,
      analytics: this.raceState.analytics,
      telemetryData: Array.from(this.telemetryData.entries()).map(([id, data]) => ({
        driverId: id,
        currentSpeed: data.speed[data.speed.length - 1] || 0,
        currentAcceleration: data.acceleration[data.acceleration.length - 1] || 0,
        engineTemp: data.engineTemp[data.engineTemp.length - 1] || 0,
        tireTemp: data.tireTemp[data.tireTemp.length - 1] || 0,
        fuelLevel: data.fuelLevel,
        tireWear: data.tireWear
      })),
      events: this.raceEvents.slice(-20) // Last 20 events
    };
  }

  /**
   * Get leaderboard with enhanced data
   */
  getLeaderboard() {
    const baseLeaderboard = super.getLeaderboard();
    
    return baseLeaderboard.map(driver => {
      const telemetry = this.telemetryData.get(driver.id);
      const strategy = this.tireStrategies.get(driver.id);
      
      return {
        ...driver,
        telemetry: telemetry ? {
          speed: telemetry.speed[telemetry.speed.length - 1] || 0,
          acceleration: telemetry.acceleration[telemetry.acceleration.length - 1] || 0,
          engineTemp: telemetry.engineTemp[telemetry.engineTemp.length - 1] || 0,
          tireTemp: telemetry.tireTemp[telemetry.tireTemp.length - 1] || 0,
          fuelLevel: telemetry.fuelLevel,
          tireWear: telemetry.tireWear
        } : null,
        strategy: strategy ? {
          currentCompound: strategy.currentCompound,
          lapsOnTires: strategy.lapsOnTires,
          nextPitStop: strategy.strategy.stops.find(s => !s.completed)
        } : null
      };
    });
  }
}

export { EnhancedF1Simulator };