/**
 * Multi-Modal Racing Simulator Factory
 * 
 * Creates different types of racing simulations:
 * - Formula 1 (single-seater racing)
 * - Formula E (electric racing)
 * - MotoGP (motorcycle racing)
 * - Drone Racing (FPV racing)
 * - Supply Chain Logistics (delivery optimization)
 * - Traffic Simulation (urban mobility)
 */

import { EnhancedF1Simulator } from './EnhancedF1Simulator.js';
import { EventEmitter } from 'events';

class MultiModalSimulator extends EventEmitter {
  constructor(mode = 'f1') {
    super();
    this.mode = mode;
    this.simulator = null;
  }

  /**
   * Create simulator based on mode
   */
  async create(track, config = {}) {
    switch (this.mode) {
      case 'f1':
        return this.createF1Simulator(track, config);
      case 'formulaE':
        return this.createFormulaESimulator(track, config);
      case 'motogp':
        return this.createMotoGPSimulator(track, config);
      case 'drones':
        return this.createDroneRacingSimulator(track, config);
      case 'logistics':
        return this.createLogisticsSimulator(track, config);
      case 'traffic':
        return this.createTrafficSimulator(track, config);
      default:
        throw new Error(`Unknown simulation mode: ${this.mode}`);
    }
  }

  /**
   * Create F1 simulator
   */
  async createF1Simulator(track, config) {
    this.simulator = new EnhancedF1Simulator();
    this.simulator.mode = 'f1';
    await this.simulator.initialize(track);
    return this.simulator;
  }

  /**
   * Create Formula E simulator
   */
  async createFormulaESimulator(track, config) {
    this.simulator = new FormulaESimulator();
    this.simulator.mode = 'formulaE';
    await this.simulator.initialize(track);
    return this.simulator;
  }

  /**
   * Create MotoGP simulator
   */
  async createMotoGPSimulator(track, config) {
    this.simulator = new MotoGPSimulator();
    this.simulator.mode = 'motogp';
    await this.simulator.initialize(track);
    return this.simulator;
  }

  /**
   * Create Drone Racing simulator
   */
  async createDroneRacingSimulator(track, config) {
    this.simulator = new DroneRacingSimulator();
    this.simulator.mode = 'drones';
    await this.simulator.initialize(track);
    return this.simulator;
  }

  /**
   * Create Logistics simulator
   */
  async createLogisticsSimulator(track, config) {
    this.simulator = new LogisticsSimulator();
    this.simulator.mode = 'logistics';
    await this.simulator.initialize(track);
    return this.simulator;
  }

  /**
   * Create Traffic simulator
   */
  async createTrafficSimulator(track, config) {
    this.simulator = new TrafficSimulator();
    this.simulator.mode = 'traffic';
    await this.simulator.initialize(track);
    return this.simulator;
  }
}

/**
 * Formula E Simulator - Electric Street Racing
 */
class FormulaESimulator extends EnhancedF1Simulator {
  constructor() {
    super();
    this.energyConsumption = new Map();
  }

  /**
   * Get Formula E specific drivers and teams
   */
  getF1Drivers() {
    return [
      // DS Penske
      { id: 1, name: 'Jean-Eric VERGNE', team: 'DS Penske', number: 25, nationality: 'FRA', color: '🟡' },
      { id: 2, name: 'Stoffel VANDOORNE', team: 'DS Penske', number: 26, nationality: 'BEL', color: '🟡' },
      
      // Jaguar TCS Racing
      { id: 3, name: 'Mitch EVANS', team: 'Jaguar TCS Racing', number: 20, nationality: 'NZL', color: '🟢' },
      { id: 4, name: 'Nick CASSIDY', team: 'Jaguar TCS Racing', number: 37, nationality: 'NZL', color: '🟢' },
      
      // Mercedes-EQS
      { id: 5, name: 'Nyck DE VRIES', team: 'Mercedes-EQS', number: 17, nationality: 'NLD', color: '🔵' },
      { id: 6, name: 'Jake DENNIS', team: 'Mercedes-EQS', number: 27, nationality: 'GBR', color: '🔵' },
      
      // NEOM McLaren
      { id: 7, name: 'Jake HUGHES', team: 'NEOM McLaren', number: 23, nationality: 'GBR', color: '🟠' },
      { id: 8, name: 'Sam BIRD', team: 'NEOM McLaren', number: 33, nationality: 'GBR', color: '🟠' },
      
      // Envision Racing
      { id: 9, name: 'Robin FRIJNS', team: 'Envision Racing', number: 4, nationality: 'NLD', color: '💚' },
      { id: 10, name: 'Sebastien BUEMI', team: 'Envision Racing', number: 23, nationality: 'CHE', color: '💚' }
    ];
  }

  /**
   * Override telemetry for electric vehicles
   */
  updateDriverTelemetry(driver) {
    super.updateDriverTelemetry(driver);
    
    const telemetry = this.telemetryData.get(driver.id);
    if (!telemetry) return;
    
    // Electric-specific metrics
    if (!this.energyConsumption.has(driver.id)) {
      this.energyConsumption.set(driver.id, {
        batteryLevel: 100,
        energyRecovery: 0,
        powerMode: 'normal' // normal, attack, efficient
      });
    }
    
    const energy = this.energyConsumption.get(driver.id);
    
    // Battery consumption based on speed and power mode
    let consumptionRate = 0.01;
    if (energy.powerMode === 'attack') consumptionRate *= 2;
    if (energy.powerMode === 'efficient') consumptionRate *= 0.5;
    
    energy.batteryLevel = Math.max(0, energy.batteryLevel - consumptionRate);
    
    // Energy recovery during braking
    if (telemetry.acceleration[telemetry.acceleration.length - 1] < -5) {
      energy.energyRecovery += 0.5;
      energy.batteryLevel = Math.min(100, energy.batteryLevel + 0.1);
    }
    
    // Update driver with electric-specific data
    driver.batteryLevel = energy.batteryLevel;
    driver.energyRecovery = energy.energyRecovery;
    driver.powerMode = energy.powerMode;
  }
}

/**
 * MotoGP Simulator - Motorcycle Racing
 */
class MotoGPSimulator extends EnhancedF1Simulator {
  constructor() {
    super();
    this.leanAngles = new Map();
  }

  /**
   * Get MotoGP riders and teams
   */
  getF1Drivers() {
    return [
      // Ducati Lenovo Team
      { id: 1, name: 'Francesco BAGNAIA', team: 'Ducati Lenovo', number: 1, nationality: 'ITA', color: '🔴' },
      { id: 2, name: 'Enea BASTIANINI', team: 'Ducati Lenovo', number: 23, nationality: 'ITA', color: '🔴' },
      
      // Red Bull KTM Factory Racing
      { id: 3, name: 'Brad BINDER', team: 'Red Bull KTM', number: 33, nationality: 'RSA', color: '🟠' },
      { id: 4, name: 'Jack MILLER', team: 'Red Bull KTM', number: 43, nationality: 'AUS', color: '🟠' },
      
      // Monster Energy Yamaha
      { id: 5, name: 'Fabio QUARTARARO', team: 'Monster Yamaha', number: 20, nationality: 'FRA', color: '🔵' },
      { id: 6, name: 'Franco MORBIDELLI', team: 'Monster Yamaha', number: 21, nationality: 'ITA', color: '🔵' },
      
      // Repsol Honda Team
      { id: 7, name: 'Marc MARQUEZ', team: 'Repsol Honda', number: 93, nationality: 'ESP', color: '🟡' },
      { id: 8, name: 'Joan MIR', team: 'Repsol Honda', number: 36, nationality: 'ESP', color: '🟡' }
    ];
  }

  /**
   * Override telemetry for motorcycles
   */
  updateDriverTelemetry(driver) {
    super.updateDriverTelemetry(driver);
    
    const telemetry = this.telemetryData.get(driver.id);
    if (!telemetry) return;
    
    // Motorcycle-specific metrics
    if (!this.leanAngles.has(driver.id)) {
      this.leanAngles.set(driver.id, {
        currentLean: 0,
        maxLean: 0,
        corneringSpeed: 0
      });
    }
    
    const lean = this.leanAngles.get(driver.id);
    
    // Calculate lean angle based on speed and cornering
    const speed = telemetry.speed[telemetry.speed.length - 1] || 0;
    lean.currentLean = Math.min(65, (speed / 300) * 45 + Math.random() * 20);
    lean.maxLean = Math.max(lean.maxLean, lean.currentLean);
    lean.corneringSpeed = speed * Math.cos(lean.currentLean * Math.PI / 180);
    
    // Update driver with motorcycle-specific data
    driver.leanAngle = lean.currentLean;
    driver.maxLeanAngle = lean.maxLean;
    driver.corneringSpeed = lean.corneringSpeed;
  }
}

/**
 * Drone Racing Simulator - FPV Racing
 */
class DroneRacingSimulator extends EnhancedF1Simulator {
  constructor() {
    super();
    this.flightData = new Map();
  }

  /**
   * Get drone pilots and teams
   */
  getF1Drivers() {
    return [
      { id: 1, name: 'Jordan TEMKIN', team: 'MultiGP Pro', number: 1, nationality: 'USA', color: '🔴' },
      { id: 2, name: 'Paul NURKKALA', team: 'Team BlackSheep', number: 2, nationality: 'USA', color: '⚫' },
      { id: 3, name: 'Evan TURNER', team: 'DRL Allianz', number: 3, nationality: 'USA', color: '🔵' },
      { id: 4, name: 'Ryan LADEMANN', team: 'Propel', number: 4, nationality: 'USA', color: '🟢' },
      { id: 5, name: 'Alex GREVE', team: 'Team Germany', number: 5, nationality: 'GER', color: '🟡' },
      { id: 6, name: 'MinChan KIM', team: 'Team Korea', number: 6, nationality: 'KOR', color: '🟣' },
      { id: 7, name: 'Jacques CHRISTENSEN', team: 'Team Denmark', number: 7, nationality: 'DEN', color: '🔴' },
      { id: 8, name: 'Luke BANNISTER', team: 'Team UK', number: 8, nationality: 'GBR', color: '🔵' }
    ];
  }

  /**
   * Override telemetry for drones
   */
  updateDriverTelemetry(driver) {
    super.updateDriverTelemetry(driver);
    
    const telemetry = this.telemetryData.get(driver.id);
    if (!telemetry) return;
    
    // Drone-specific metrics
    if (!this.flightData.has(driver.id)) {
      this.flightData.set(driver.id, {
        altitude: 10,
        verticalSpeed: 0,
        batteryVoltage: 16.8,
        propSpeed: 0
      });
    }
    
    const flight = this.flightData.get(driver.id);
    
    // Update flight metrics
    const speed = telemetry.speed[telemetry.speed.length - 1] || 0;
    flight.altitude = 5 + Math.sin(Date.now() / 1000) * 3; // 2-8m altitude
    flight.verticalSpeed = Math.random() * 4 - 2; // -2 to +2 m/s
    flight.batteryVoltage = Math.max(14.4, 16.8 - (speed / 100) * 0.1);
    flight.propSpeed = (speed / 120) * 8000; // RPM
    
    // Update driver with drone-specific data
    driver.altitude = flight.altitude;
    driver.verticalSpeed = flight.verticalSpeed;
    driver.batteryVoltage = flight.batteryVoltage;
    driver.propSpeed = flight.propSpeed;
  }
}

/**
 * Logistics Simulator - Supply Chain Optimization
 */
class LogisticsSimulator extends EnhancedF1Simulator {
  constructor() {
    super();
    this.deliveryData = new Map();
  }

  /**
   * Get delivery vehicles and companies
   */
  getF1Drivers() {
    return [
      { id: 1, name: 'UPS Express', team: 'UPS', number: 1, nationality: 'USA', color: '🟤' },
      { id: 2, name: 'FedEx Priority', team: 'FedEx', number: 2, nationality: 'USA', color: '🟣' },
      { id: 3, name: 'DHL Speed', team: 'DHL', number: 3, nationality: 'GER', color: '🟡' },
      { id: 4, name: 'Amazon Prime', team: 'Amazon', number: 4, nationality: 'USA', color: '🟠' },
      { id: 5, name: 'USPS Express', team: 'USPS', number: 5, nationality: 'USA', color: '🔵' },
      { id: 6, name: 'TNT Direct', team: 'TNT', number: 6, nationality: 'NLD', color: '🟠' },
      { id: 7, name: 'PostNL Rapid', team: 'PostNL', number: 7, nationality: 'NLD', color: '🟠' },
      { id: 8, name: 'Royal Mail', team: 'Royal Mail', number: 8, nationality: 'GBR', color: '🔴' }
    ];
  }

  /**
   * Override telemetry for delivery vehicles
   */
  updateDriverTelemetry(driver) {
    super.updateDriverTelemetry(driver);
    
    const telemetry = this.telemetryData.get(driver.id);
    if (!telemetry) return;
    
    // Logistics-specific metrics
    if (!this.deliveryData.has(driver.id)) {
      this.deliveryData.set(driver.id, {
        packages: Math.floor(Math.random() * 100) + 50,
        deliveries: 0,
        efficiency: Math.random() * 0.3 + 0.7,
        routeOptimization: Math.random() * 0.4 + 0.6
      });
    }
    
    const delivery = this.deliveryData.get(driver.id);
    
    // Simulate package deliveries
    if (Math.random() < 0.01) { // Delivery every ~100 updates
      delivery.deliveries++;
      delivery.packages = Math.max(0, delivery.packages - 1);
    }
    
    // Update driver with logistics-specific data
    driver.packages = delivery.packages;
    driver.deliveries = delivery.deliveries;
    driver.efficiency = delivery.efficiency;
    driver.routeOptimization = delivery.routeOptimization;
  }
}

/**
 * Traffic Simulator - Urban Mobility Analysis
 */
class TrafficSimulator extends EnhancedF1Simulator {
  constructor() {
    super();
    this.trafficData = new Map();
  }

  /**
   * Get traffic participants
   */
  getF1Drivers() {
    return [
      { id: 1, name: 'City Bus 101', team: 'Public Transport', number: 101, nationality: 'LOCAL', color: '🔵' },
      { id: 2, name: 'Taxi Alpha', team: 'Taxi Service', number: 201, nationality: 'LOCAL', color: '🟡' },
      { id: 3, name: 'Delivery Van', team: 'Logistics', number: 301, nationality: 'LOCAL', color: '🟤' },
      { id: 4, name: 'Emergency Unit', team: 'Emergency', number: 911, nationality: 'LOCAL', color: '🔴' },
      { id: 5, name: 'Private Car A', team: 'Commuter', number: 401, nationality: 'LOCAL', color: '⚪' },
      { id: 6, name: 'Private Car B', team: 'Commuter', number: 402, nationality: 'LOCAL', color: '⚫' },
      { id: 7, name: 'Motorcycle', team: 'Two Wheeler', number: 501, nationality: 'LOCAL', color: '🟠' },
      { id: 8, name: 'Bicycle', team: 'Eco Transport', number: 601, nationality: 'LOCAL', color: '🟢' }
    ];
  }

  /**
   * Override telemetry for traffic simulation
   */
  updateDriverTelemetry(driver) {
    super.updateDriverTelemetry(driver);
    
    const telemetry = this.telemetryData.get(driver.id);
    if (!telemetry) return;
    
    // Traffic-specific metrics
    if (!this.trafficData.has(driver.id)) {
      this.trafficData.set(driver.id, {
        congestionLevel: Math.random() * 0.5 + 0.2,
        pollution: Math.random() * 50 + 20,
        fuelEfficiency: Math.random() * 30 + 15,
        safetyScore: Math.random() * 30 + 70
      });
    }
    
    const traffic = this.trafficData.get(driver.id);
    
    // Update traffic metrics based on speed and conditions
    const speed = telemetry.speed[telemetry.speed.length - 1] || 0;
    traffic.congestionLevel = speed < 30 ? 0.8 : speed < 60 ? 0.4 : 0.1;
    traffic.pollution = (100 - speed) / 2 + Math.random() * 10;
    traffic.fuelEfficiency = Math.max(5, 40 - (speed / 10));
    
    // Update driver with traffic-specific data
    driver.congestionLevel = traffic.congestionLevel;
    driver.pollution = traffic.pollution;
    driver.fuelEfficiency = traffic.fuelEfficiency;
    driver.safetyScore = traffic.safetyScore;
  }
}

export { 
  MultiModalSimulator,
  FormulaESimulator,
  MotoGPSimulator,
  DroneRacingSimulator,
  LogisticsSimulator,
  TrafficSimulator
};