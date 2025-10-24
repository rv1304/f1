/**
 * VelocityForge F1 Car Database
 * 
 * Comprehensive database of F1 car specifications, performance characteristics,
 * and technical parameters for realistic simulation.
 */

export const F1_CARS = {
  // 2024 F1 Cars
  'red_bull_rb20': {
    id: 'red_bull_rb20',
    name: 'Red Bull RB20',
    team: 'Red Bull Racing',
    year: 2024,
    
    // Engine Specifications
    engine: {
      manufacturer: 'Honda RBPT',
      type: 'V6 Turbo Hybrid',
      displacement: 1.6, // liters
      maxRPM: 15000,
      powerOutput: 1000, // HP (ICE + ERS)
      torque: 800, // Nm
      fuelCapacity: 110, // kg
      fuelConsumption: 100, // kg/race (lower = better)
      reliability: 95 // 0-100
    },
    
    // Aerodynamics
    aerodynamics: {
      downforce: 95, // 0-100 (higher = more downforce)
      dragCoefficient: 0.75, // Lower = better
      frontWingEfficiency: 92,
      rearWingEfficiency: 90,
      floorEfficiency: 98,
      diffuserEfficiency: 96,
      drsEffectiveness: 88 // DRS speed gain %
    },
    
    // Chassis & Suspension
    chassis: {
      weight: 798, // kg (minimum weight)
      weightDistribution: 45.5, // % front
      stiffness: 95, // 0-100
      suspensionTravel: 85, // 0-100
      rideHeight: 15, // mm
      wheelbase: 3600, // mm
      trackWidth: 2000 // mm
    },
    
    // Tires & Brakes
    tires: {
      frontWidth: 305, // mm
      rearWidth: 405, // mm
      diameter: 18, // inches
      compoundOptions: ['soft', 'medium', 'hard', 'intermediate', 'wet'],
      degradationRate: 85, // 0-100 (lower = better tire life)
      gripLevel: 92, // 0-100
      temperatureSensitivity: 80 // 0-100 (lower = better)
    },
    
    brakes: {
      type: 'Carbon-Ceramic',
      frontDiameter: 278, // mm
      rearDiameter: 266, // mm
      coolingEfficiency: 90, // 0-100
      fadeResistance: 88, // 0-100
      stoppingPower: 95 // 0-100
    },
    
    // Performance Characteristics
    performance: {
      topSpeed: 340, // km/h
      acceleration: 95, // 0-100
      corneringSpeed: 92, // 0-100
      braking: 94, // 0-100
      traction: 93, // 0-100
      stability: 96, // 0-100
      responsiveness: 94 // 0-100
    },
    
    // ERS (Energy Recovery System)
    ers: {
      batteryCapacity: 4, // MJ
      deploymentPower: 120, // kW
      recoveryEfficiency: 90, // %
      deploymentEfficiency: 88, // %
      harvestingRate: 85 // 0-100
    },
    
    // Reliability & Maintenance
    reliability: {
      engineReliability: 95,
      gearboxReliability: 92,
      ersReliability: 88,
      suspensionReliability: 90,
      brakeReliability: 94,
      overallReliability: 92
    },
    
    // Setup Parameters
    setup: {
      frontWingAngle: 0, // degrees
      rearWingAngle: 0, // degrees
      rideHeightFront: 15, // mm
      rideHeightRear: 15, // mm
      camberFront: -3.5, // degrees
      camberRear: -2.0, // degrees
      toeFront: 0.1, // degrees
      toeRear: 0.2, // degrees
      antiRollFront: 50, // %
      antiRollRear: 50, // %
      brakeBalance: 50, // % front
      differential: 50 // % lock
    }
  },

  'ferrari_sf24': {
    id: 'ferrari_sf24',
    name: 'Ferrari SF-24',
    team: 'Ferrari',
    year: 2024,
    
    engine: {
      manufacturer: 'Ferrari',
      type: 'V6 Turbo Hybrid',
      displacement: 1.6,
      maxRPM: 15000,
      powerOutput: 995,
      torque: 795,
      fuelCapacity: 110,
      fuelConsumption: 102,
      reliability: 88
    },
    
    aerodynamics: {
      downforce: 92,
      dragCoefficient: 0.78,
      frontWingEfficiency: 90,
      rearWingEfficiency: 88,
      floorEfficiency: 94,
      diffuserEfficiency: 92,
      drsEffectiveness: 85
    },
    
    chassis: {
      weight: 798,
      weightDistribution: 45.8,
      stiffness: 92,
      suspensionTravel: 88,
      rideHeight: 16,
      wheelbase: 3600,
      trackWidth: 2000
    },
    
    tires: {
      frontWidth: 305,
      rearWidth: 405,
      diameter: 18,
      compoundOptions: ['soft', 'medium', 'hard', 'intermediate', 'wet'],
      degradationRate: 88,
      gripLevel: 90,
      temperatureSensitivity: 85
    },
    
    brakes: {
      type: 'Carbon-Ceramic',
      frontDiameter: 278,
      rearDiameter: 266,
      coolingEfficiency: 88,
      fadeResistance: 85,
      stoppingPower: 92
    },
    
    performance: {
      topSpeed: 338,
      acceleration: 93,
      corneringSpeed: 90,
      braking: 92,
      traction: 91,
      stability: 94,
      responsiveness: 92
    },
    
    ers: {
      batteryCapacity: 4,
      deploymentPower: 118,
      recoveryEfficiency: 88,
      deploymentEfficiency: 86,
      harvestingRate: 82
    },
    
    reliability: {
      engineReliability: 88,
      gearboxReliability: 90,
      ersReliability: 85,
      suspensionReliability: 88,
      brakeReliability: 92,
      overallReliability: 88
    },
    
    setup: {
      frontWingAngle: 0,
      rearWingAngle: 0,
      rideHeightFront: 16,
      rideHeightRear: 16,
      camberFront: -3.3,
      camberRear: -1.8,
      toeFront: 0.1,
      toeRear: 0.2,
      antiRollFront: 48,
      antiRollRear: 52,
      brakeBalance: 52,
      differential: 48
    }
  },

  'mercedes_w15': {
    id: 'mercedes_w15',
    name: 'Mercedes W15',
    team: 'Mercedes',
    year: 2024,
    
    engine: {
      manufacturer: 'Mercedes',
      type: 'V6 Turbo Hybrid',
      displacement: 1.6,
      maxRPM: 15000,
      powerOutput: 990,
      torque: 790,
      fuelCapacity: 110,
      fuelConsumption: 105,
      reliability: 90
    },
    
    aerodynamics: {
      downforce: 88,
      dragCoefficient: 0.80,
      frontWingEfficiency: 88,
      rearWingEfficiency: 86,
      floorEfficiency: 90,
      diffuserEfficiency: 88,
      drsEffectiveness: 82
    },
    
    chassis: {
      weight: 798,
      weightDistribution: 46.0,
      stiffness: 90,
      suspensionTravel: 90,
      rideHeight: 17,
      wheelbase: 3600,
      trackWidth: 2000
    },
    
    tires: {
      frontWidth: 305,
      rearWidth: 405,
      diameter: 18,
      compoundOptions: ['soft', 'medium', 'hard', 'intermediate', 'wet'],
      degradationRate: 90,
      gripLevel: 88,
      temperatureSensitivity: 88
    },
    
    brakes: {
      type: 'Carbon-Ceramic',
      frontDiameter: 278,
      rearDiameter: 266,
      coolingEfficiency: 90,
      fadeResistance: 88,
      stoppingPower: 90
    },
    
    performance: {
      topSpeed: 335,
      acceleration: 90,
      corneringSpeed: 88,
      braking: 90,
      traction: 89,
      stability: 92,
      responsiveness: 90
    },
    
    ers: {
      batteryCapacity: 4,
      deploymentPower: 115,
      recoveryEfficiency: 90,
      deploymentEfficiency: 88,
      harvestingRate: 85
    },
    
    reliability: {
      engineReliability: 90,
      gearboxReliability: 88,
      ersReliability: 87,
      suspensionReliability: 90,
      brakeReliability: 90,
      overallReliability: 89
    },
    
    setup: {
      frontWingAngle: 0,
      rearWingAngle: 0,
      rideHeightFront: 17,
      rideHeightRear: 17,
      camberFront: -3.0,
      camberRear: -1.5,
      toeFront: 0.1,
      toeRear: 0.2,
      antiRollFront: 45,
      antiRollRear: 55,
      brakeBalance: 48,
      differential: 52
    }
  },

  'mclaren_mcl38': {
    id: 'mclaren_mcl38',
    name: 'McLaren MCL38',
    team: 'McLaren',
    year: 2024,
    
    engine: {
      manufacturer: 'Mercedes',
      type: 'V6 Turbo Hybrid',
      displacement: 1.6,
      maxRPM: 15000,
      powerOutput: 990,
      torque: 790,
      fuelCapacity: 110,
      fuelConsumption: 105,
      reliability: 90
    },
    
    aerodynamics: {
      downforce: 90,
      dragCoefficient: 0.77,
      frontWingEfficiency: 89,
      rearWingEfficiency: 87,
      floorEfficiency: 92,
      diffuserEfficiency: 90,
      drsEffectiveness: 84
    },
    
    chassis: {
      weight: 798,
      weightDistribution: 45.7,
      stiffness: 88,
      suspensionTravel: 87,
      rideHeight: 16,
      wheelbase: 3600,
      trackWidth: 2000
    },
    
    tires: {
      frontWidth: 305,
      rearWidth: 405,
      diameter: 18,
      compoundOptions: ['soft', 'medium', 'hard', 'intermediate', 'wet'],
      degradationRate: 87,
      gripLevel: 89,
      temperatureSensitivity: 83
    },
    
    brakes: {
      type: 'Carbon-Ceramic',
      frontDiameter: 278,
      rearDiameter: 266,
      coolingEfficiency: 87,
      fadeResistance: 86,
      stoppingPower: 89
    },
    
    performance: {
      topSpeed: 336,
      acceleration: 91,
      corneringSpeed: 89,
      braking: 89,
      traction: 88,
      stability: 91,
      responsiveness: 89
    },
    
    ers: {
      batteryCapacity: 4,
      deploymentPower: 115,
      recoveryEfficiency: 88,
      deploymentEfficiency: 86,
      harvestingRate: 83
    },
    
    reliability: {
      engineReliability: 90,
      gearboxReliability: 87,
      ersReliability: 86,
      suspensionReliability: 87,
      brakeReliability: 89,
      overallReliability: 88
    },
    
    setup: {
      frontWingAngle: 0,
      rearWingAngle: 0,
      rideHeightFront: 16,
      rideHeightRear: 16,
      camberFront: -3.2,
      camberRear: -1.7,
      toeFront: 0.1,
      toeRear: 0.2,
      antiRollFront: 47,
      antiRollRear: 53,
      brakeBalance: 51,
      differential: 49
    }
  }
};

/**
 * Get car by ID
 */
export function getCar(carId) {
  return F1_CARS[carId] || null;
}

/**
 * Get all cars
 */
export function getAllCars() {
  return Object.values(F1_CARS);
}

/**
 * Get cars by team
 */
export function getCarsByTeam(team) {
  return Object.values(F1_CARS).filter(car => car.team === team);
}

/**
 * Calculate car performance score
 */
export function calculateCarPerformance(carId, trackType = 'balanced') {
  const car = getCar(carId);
  if (!car) return 0;
  
  const weights = {
    'power': { acceleration: 0.4, topSpeed: 0.3, traction: 0.3 },
    'downforce': { corneringSpeed: 0.4, stability: 0.3, responsiveness: 0.3 },
    'balanced': { 
      acceleration: 0.2, 
      corneringSpeed: 0.2, 
      braking: 0.2, 
      stability: 0.2, 
      responsiveness: 0.2 
    },
    'street': { braking: 0.3, responsiveness: 0.3, stability: 0.4 }
  };
  
  const trackWeights = weights[trackType] || weights.balanced;
  let score = 0;
  let totalWeight = 0;
  
  for (const [metric, weight] of Object.entries(trackWeights)) {
    score += car.performance[metric] * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? score / totalWeight : 0;
}

/**
 * Calculate tire degradation rate
 */
export function calculateTireDegradation(carId, trackConditions) {
  const car = getCar(carId);
  if (!car) return 1.0;
  
  const baseDegradation = car.tires.degradationRate / 100;
  const temperatureFactor = trackConditions.temperature / 30; // Normalize to 30°C
  const surfaceFactor = trackConditions.surfaceRoughness || 1.0;
  
  return baseDegradation * temperatureFactor * surfaceFactor;
}

/**
 * Calculate fuel consumption rate
 */
export function calculateFuelConsumption(carId, drivingStyle) {
  const car = getCar(carId);
  if (!car) return 1.0;
  
  const baseConsumption = car.engine.fuelConsumption / 100;
  const styleFactor = {
    'conservative': 0.9,
    'balanced': 1.0,
    'aggressive': 1.1,
    'qualifying': 1.2
  }[drivingStyle] || 1.0;
  
  return baseConsumption * styleFactor;
}
