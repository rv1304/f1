/**
 * VelocityForge F1 Agent
 * 
 * Specialized F1 driver agent with realistic performance characteristics,
 * driving styles, and race behavior based on real driver data.
 */

import { Agent } from '../agents/AgentManager.js';
import { Vector3 } from '../utils/Vector3.js';
import { getDriver } from '../data/F1Drivers.js';
import { getCar } from '../data/F1Cars.js';
import { getTrack } from '../data/F1Tracks.js';

export class F1Agent extends Agent {
  constructor(config) {
    // Load driver and car data
    const driverData = getDriver(config.driverId);
    const carData = getCar(config.carId);
    
    // If data not found, create fallback data
    if (!driverData) {
      console.warn(`⚠️ Driver data not found for ${config.driverId}, using fallback`);
    }
    if (!carData) {
      console.warn(`⚠️ Car data not found for ${config.carId}, using fallback`);
    }
    
    // Merge driver and car data into agent config
    const f1Config = {
      ...config,
      name: driverData?.name || config.name || 'Unknown Driver',
      type: 'f1',
      
      // Driver-specific traits
      traits: {
        ...(driverData?.stats || {}),
        ...(driverData?.drivingStyle || {}),
        ...config.traits
      },
      
      // Car-specific physics
      physics: {
        mass: (carData?.chassis?.weight || 800) / 1000, // Convert to kg
        radius: 0.4, // F1 car radius
        dragCoefficient: carData?.aerodynamics?.dragCoefficient || 0.75,
        frictionCoefficient: 0.8,
        restitution: 0.6,
        crossSectionalArea: 1.5, // F1 car cross-sectional area
        affectedByGravity: true,
        onGround: true,
        thrust: new Vector3(0, 0, 0),
        
        // F1-specific physics
        downforce: carData?.aerodynamics?.downforce || 90,
        powerOutput: carData?.engine?.powerOutput || 1000,
        maxSpeed: carData?.performance?.topSpeed || 340,
        acceleration: carData?.performance?.acceleration || 95,
        corneringSpeed: carData?.performance?.corneringSpeed || 92,
        braking: carData?.performance?.braking || 94,
        traction: carData?.performance?.traction || 93,
        stability: carData?.performance?.stability || 96,
        responsiveness: carData?.performance?.responsiveness || 94
      },
      
      // F1-specific AI behavior
      ai: {
        enabled: true,
        behavior: 'f1_race',
        target: null,
        waypoints: [],
        currentWaypointIndex: 0,
        lastDecisionTime: 0,
        decisionInterval: 0.05, // 20Hz for F1 precision
        
        // F1-specific AI parameters
        racingLine: 'optimal',
        fuelMode: 'balanced',
        tireMode: 'balanced',
        ersMode: 'balanced',
        drsEnabled: false,
        pitStopStrategy: 'standard'
      }
    };
    
    super(f1Config);
    
    // Store references to driver and car data
    this.driverData = driverData || {
      name: config.name || 'Unknown Driver',
      team: config.team || 'Unknown Team',
      stats: {},
      drivingStyle: {}
    };
    this.carData = carData || {
      chassis: { weight: 800 },
      aerodynamics: { dragCoefficient: 0.75, downforce: 90 },
      engine: { powerOutput: 1000 },
      performance: { topSpeed: 340, acceleration: 95, corneringSpeed: 92, braking: 94, traction: 93, stability: 96, responsiveness: 94 }
    };
    this.trackData = null;
    this.weatherSystem = null;
    
    // F1-specific metrics
    this.f1Metrics = {
      sectorTimes: [0, 0, 0],
      bestSectorTimes: [Infinity, Infinity, Infinity],
      lapTime: 0,
      bestLapTime: Infinity,
      totalLaps: 0,
      position: 0,
      gridPosition: 0,
      points: 0,
      fuelLevel: 110, // kg
      tireWear: [100, 100, 100, 100], // Front Left, Front Right, Rear Left, Rear Right
      tireCompound: 'medium',
      tireAge: 0, // laps
      ersLevel: 4, // MJ
      drsAvailable: true,
      drsUsed: 0,
      pitStops: 0,
      pitStopTime: 0,
      penalties: 0,
      incidents: 0,
      overtakes: 0,
      positionsGained: 0,
      positionsLost: 0
    };
    
    // F1-specific state
    this.f1State = {
      inPitLane: false,
      inPitBox: false,
      onTrack: true,
      inDRSZone: false,
      underSafetyCar: false,
      underVirtualSafetyCar: false,
      underRedFlag: false,
      raceMode: 'race', // race, qualifying, practice
      sessionPhase: 'formation_lap', // formation_lap, racing, safety_car, red_flag
      lastPitStop: 0,
      nextPitStop: 0,
      targetLapTime: 0,
      fuelTarget: 0,
      tireTarget: 0
    };
    
    // Initialize F1-specific setup
    this.initializeF1();
  }

  /**
   * Initialize F1-specific properties
   */
  initializeF1() {
    // Set initial fuel level
    this.f1Metrics.fuelLevel = this.carData.engine.fuelCapacity;
    
    // Set initial tire compound
    this.f1Metrics.tireCompound = 'medium';
    
    // Set initial ERS level
    this.f1Metrics.ersLevel = this.carData.ers.batteryCapacity;
    
    // Set initial position
    this.f1State.raceMode = 'race';
    this.f1State.sessionPhase = 'formation_lap';
  }

  /**
   * Set track data
   */
  setTrack(trackId) {
    this.trackData = getTrack(trackId);
    if (this.trackData) {
      // Set track-specific waypoints
      this.setTrackWaypoints();
    }
  }

  /**
   * Set weather system
   */
  setWeatherSystem(weatherSystem) {
    this.weatherSystem = weatherSystem;
  }

  /**
   * Set track waypoints based on track layout
   */
  setTrackWaypoints() {
    if (!this.trackData) return;
    
    const waypoints = [];
    const trackLength = this.trackData.length;
    const waypointCount = 50; // 50 waypoints around the track
    
    for (let i = 0; i < waypointCount; i++) {
      const progress = i / waypointCount;
      const angle = progress * Math.PI * 2; // Full circle
      const radius = 100; // Track radius
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      waypoints.push(new Vector3(x, 0, z));
    }
    
    this.setWaypoints(waypoints);
  }

  /**
   * Update F1 agent
   */
  update(deltaTime, currentTime) {
    if (!this.isActive || !this.isAlive) return;
    
    // Update F1-specific AI
    if (this.ai.enabled && currentTime - this.ai.lastDecisionTime >= this.ai.decisionInterval) {
      this.updateF1AI(deltaTime, currentTime);
      this.ai.lastDecisionTime = currentTime;
    }
    
    // Update F1 metrics
    this.updateF1Metrics(deltaTime);
    
    // Update F1 state
    this.updateF1State(deltaTime);
    
    // Call parent update
    super.update(deltaTime, currentTime);
  }

  /**
   * Update F1-specific AI behavior
   */
  updateF1AI(deltaTime, currentTime) {
    switch (this.f1State.sessionPhase) {
      case 'formation_lap':
        this.formationLapBehavior(deltaTime);
        break;
      case 'racing':
        this.racingBehavior(deltaTime);
        break;
      case 'safety_car':
        this.safetyCarBehavior(deltaTime);
        break;
      case 'red_flag':
        this.redFlagBehavior(deltaTime);
        break;
    }
  }

  /**
   * Formation lap behavior
   */
  formationLapBehavior(deltaTime) {
    // Follow the car in front at safe distance
    const targetSpeed = 80; // km/h
    const targetVelocity = new Vector3(0, 0, targetSpeed / 3.6); // Convert to m/s
    this.physics.thrust = targetVelocity.multiplyScalar(0.1);
  }

  /**
   * Racing behavior
   */
  racingBehavior(deltaTime) {
    // Calculate optimal racing line
    const racingLine = this.calculateRacingLine();
    
    // Calculate target speed based on track conditions
    const targetSpeed = this.calculateTargetSpeed();
    
    // Calculate fuel consumption
    this.calculateFuelConsumption(deltaTime);
    
    // Calculate tire wear
    this.calculateTireWear(deltaTime);
    
    // Calculate ERS usage
    this.calculateERSUsage(deltaTime);
    
    // Apply driving style
    this.applyDrivingStyle(targetSpeed, racingLine);
    
    // Check for pit stop
    this.checkPitStop();
    
    // Check for DRS
    this.checkDRS();
  }

  /**
   * Safety car behavior
   */
  safetyCarBehavior(deltaTime) {
    // Follow safety car at safe distance
    const targetSpeed = 60; // km/h
    const targetVelocity = new Vector3(0, 0, targetSpeed / 3.6);
    this.physics.thrust = targetVelocity.multiplyScalar(0.05);
  }

  /**
   * Red flag behavior
   */
  redFlagBehavior(deltaTime) {
    // Stop the car
    this.physics.thrust = new Vector3(0, 0, 0);
    this.physics.velocity.multiplyScalar(0.9); // Gradual deceleration
  }

  /**
   * Calculate racing line
   */
  calculateRacingLine() {
    if (!this.trackData) return new Vector3(0, 0, 1);
    
    // Simple racing line calculation
    // In a real implementation, this would be much more sophisticated
    const currentWaypoint = this.ai.waypoints[this.ai.currentWaypointIndex];
    if (!currentWaypoint) return new Vector3(0, 0, 1);
    
    const direction = currentWaypoint.clone().subtract(this.physics.position).normalize();
    return direction;
  }

  /**
   * Calculate target speed based on track conditions
   */
  calculateTargetSpeed() {
    let baseSpeed = this.carData.performance.topSpeed;
    
    // Adjust for driver skill
    const driverSkill = this.driverData.stats.rawSpeed / 100;
    baseSpeed *= driverSkill;
    
    // Adjust for weather
    if (this.weatherSystem) {
      const weatherImpact = this.weatherSystem.calculatePerformanceImpact(this.carData.id, this.driverData.id);
      baseSpeed *= (1 + weatherImpact.overall / 100);
    }
    
    // Adjust for tire condition
    const tireCondition = this.f1Metrics.tireWear.reduce((sum, wear) => sum + wear, 0) / 400;
    baseSpeed *= tireCondition;
    
    // Adjust for fuel load
    const fuelFactor = 1 - (this.f1Metrics.fuelLevel / this.carData.engine.fuelCapacity) * 0.1;
    baseSpeed *= fuelFactor;
    
    return Math.max(baseSpeed * 0.5, baseSpeed); // Minimum 50% of base speed
  }

  /**
   * Calculate fuel consumption
   */
  calculateFuelConsumption(deltaTime) {
    const baseConsumption = this.carData.engine.fuelConsumption / 100; // kg/s
    const speedFactor = this.physics.velocity.length() / 100; // Normalize to 100 m/s
    const styleFactor = this.driverData.drivingStyle.aggression / 100;
    
    const consumption = baseConsumption * speedFactor * styleFactor * deltaTime;
    this.f1Metrics.fuelLevel = Math.max(0, this.f1Metrics.fuelLevel - consumption);
  }

  /**
   * Calculate tire wear
   */
  calculateTireWear(deltaTime) {
    const baseWear = this.carData.tires.degradationRate / 100; // % per second
    const speedFactor = this.physics.velocity.length() / 100;
    const styleFactor = this.driverData.drivingStyle.aggression / 100;
    
    const wear = baseWear * speedFactor * styleFactor * deltaTime;
    
    for (let i = 0; i < this.f1Metrics.tireWear.length; i++) {
      this.f1Metrics.tireWear[i] = Math.max(0, this.f1Metrics.tireWear[i] - wear);
    }
  }

  /**
   * Calculate ERS usage
   */
  calculateERSUsage(deltaTime) {
    if (this.f1Metrics.ersLevel <= 0) return;
    
    const baseUsage = this.carData.ers.deploymentPower / 1000; // kW to MJ/s
    const usage = baseUsage * deltaTime;
    
    this.f1Metrics.ersLevel = Math.max(0, this.f1Metrics.ersLevel - usage);
  }

  /**
   * Apply driving style
   */
  applyDrivingStyle(targetSpeed, racingLine) {
    const speed = this.physics.velocity.length();
    const targetSpeedMS = targetSpeed / 3.6; // Convert km/h to m/s
    
    // Calculate thrust needed
    const speedDifference = targetSpeedMS - speed;
    const thrustMagnitude = Math.max(0, speedDifference * 10); // Acceleration factor
    
    // Apply driving style modifiers
    const aggression = this.driverData.stats.aggression / 100;
    const consistency = this.driverData.stats.consistency / 100;
    
    const finalThrust = thrustMagnitude * (0.8 + aggression * 0.4) * consistency;
    
    // Apply thrust in racing line direction
    const thrust = racingLine.clone().multiplyScalar(finalThrust);
    this.physics.thrust = thrust;
  }

  /**
   * Check for pit stop
   */
  checkPitStop() {
    const fuelLow = this.f1Metrics.fuelLevel < 20; // kg
    const tireWorn = this.f1Metrics.tireWear.some(wear => wear < 30); // %
    
    if (fuelLow || tireWorn) {
      this.f1State.nextPitStop = this.f1Metrics.totalLaps + 1;
    }
  }

  /**
   * Check for DRS
   */
  checkDRS() {
    if (!this.trackData) return;
    
    // Check if in DRS zone
    const trackProgress = this.getTrackProgress();
    const inDRSZone = this.trackData.drsZones.some(zone => 
      trackProgress >= zone.start && trackProgress <= zone.end
    );
    
    this.f1State.inDRSZone = inDRSZone;
    
    // Enable DRS if conditions are met
    if (inDRSZone && this.f1Metrics.drsAvailable) {
      this.ai.drsEnabled = true;
      this.f1Metrics.drsUsed++;
    } else {
      this.ai.drsEnabled = false;
    }
  }

  /**
   * Get track progress (0-1)
   */
  getTrackProgress() {
    if (!this.trackData) return 0;
    
    const trackLength = this.trackData.length * 1000; // Convert to meters
    const distanceTraveled = this.f1Metrics.totalDistance;
    
    return (distanceTraveled % trackLength) / trackLength;
  }

  /**
   * Update F1 metrics
   */
  updateF1Metrics(deltaTime) {
    // Update distance traveled
    const distance = this.physics.velocity.length() * deltaTime;
    this.f1Metrics.totalDistance += distance;
    
    // Update lap time
    this.f1Metrics.lapTime += deltaTime;
    
    // Update tire age
    this.f1Metrics.tireAge += deltaTime;
  }

  /**
   * Update F1 state
   */
  updateF1State(deltaTime) {
    // Update session phase based on race conditions
    if (this.f1State.sessionPhase === 'formation_lap' && this.f1Metrics.totalLaps > 0) {
      this.f1State.sessionPhase = 'racing';
    }
  }

  /**
   * Complete a lap
   */
  completeLap() {
    this.f1Metrics.totalLaps++;
    
    // Update best lap time
    if (this.f1Metrics.lapTime < this.f1Metrics.bestLapTime) {
      this.f1Metrics.bestLapTime = this.f1Metrics.lapTime;
    }
    
    // Reset lap time
    this.f1Metrics.lapTime = 0;
    
    // Emit lap complete event
    this.emitEvent('f1:lapComplete', {
      driver: this.driverData.name,
      lapTime: this.f1Metrics.lapTime,
      totalLaps: this.f1Metrics.totalLaps,
      position: this.f1Metrics.position
    });
  }

  /**
   * Get F1-specific state
   */
  getF1State() {
    return {
      driver: this.driverData,
      car: this.carData,
      metrics: { ...this.f1Metrics },
      state: { ...this.f1State }
    };
  }

  /**
   * Get F1 telemetry data
   */
  getTelemetry() {
    return {
      timestamp: performance.now(),
      driver: this.driverData.name,
      position: this.physics.position.toObject(),
      velocity: this.physics.velocity.toObject(),
      acceleration: this.physics.acceleration.toObject(),
      fuelLevel: this.f1Metrics.fuelLevel,
      tireWear: [...this.f1Metrics.tireWear],
      tireCompound: this.f1Metrics.tireCompound,
      ersLevel: this.f1Metrics.ersLevel,
      drsEnabled: this.ai.drsEnabled,
      lapTime: this.f1Metrics.lapTime,
      sectorTimes: [...this.f1Metrics.sectorTimes],
      gear: this.calculateGear(),
      rpm: this.calculateRPM(),
      throttle: this.calculateThrottle(),
      brake: this.calculateBrake(),
      steering: this.calculateSteering()
    };
  }

  /**
   * Calculate current gear (simplified)
   */
  calculateGear() {
    const speed = this.physics.velocity.length() * 3.6; // Convert to km/h
    return Math.min(8, Math.max(1, Math.floor(speed / 20))); // 8-speed gearbox
  }

  /**
   * Calculate RPM (simplified)
   */
  calculateRPM() {
    const speed = this.physics.velocity.length() * 3.6; // Convert to km/h
    return Math.min(15000, Math.max(5000, speed * 50)); // RPM based on speed
  }

  /**
   * Calculate throttle position (simplified)
   */
  calculateThrottle() {
    const thrust = this.physics.thrust.length();
    return Math.min(100, Math.max(0, thrust * 10)); // 0-100%
  }

  /**
   * Calculate brake position (simplified)
   */
  calculateBrake() {
    const deceleration = this.physics.acceleration.length();
    return Math.min(100, Math.max(0, deceleration * 5)); // 0-100%
  }

  /**
   * Calculate steering angle (simplified)
   */
  calculateSteering() {
    const angularVelocity = this.physics.velocity.length();
    return Math.min(30, Math.max(-30, angularVelocity * 0.1)); // -30 to +30 degrees
  }
}
