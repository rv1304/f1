/**
 * VelocityForge F1 Driver Database
 * 
 * Comprehensive database of F1 drivers with real performance data,
 * driving styles, and statistical profiles.
 */

export const F1_DRIVERS = {
  // Current F1 Grid (2024)
  'max_verstappen': {
    id: 'max_verstappen',
    name: 'Max Verstappen',
    nationality: 'Dutch',
    team: 'Red Bull Racing',
    number: 1,
    age: 26,
    experience: 9, // years in F1
    
    // Performance Stats (0-100 scale)
    stats: {
      rawSpeed: 95,        // Pure pace
      racecraft: 92,       // Race intelligence
      consistency: 88,     // Consistency over race distance
      wetWeather: 90,      // Performance in wet conditions
      tireManagement: 85,  // Tire preservation
      fuelEfficiency: 82,  // Fuel saving ability
      overtaking: 94,      // Overtaking skill
      defending: 91,       // Defensive driving
      qualifying: 93,      // One-lap pace
      starts: 87,          // Race start performance
      pitstops: 89,        // Pit lane performance
      adaptability: 96,    // Adapting to car changes
      pressure: 94,        // Performance under pressure
      aggression: 88,      // Aggressiveness level
      patience: 75,        // Patience in racing
      technical: 90        // Technical feedback
    },
    
    // Driving Style
    drivingStyle: {
      preferredLine: 'late_braking',
      corneringStyle: 'aggressive',
      throttleApplication: 'smooth',
      brakingStyle: 'late_and_hard',
      riskTolerance: 'high',
      fuelSavingMode: 'moderate',
      tireConservation: 'moderate'
    },
    
    // Special Abilities
    specialAbilities: [
      'wet_weather_master',
      'overtaking_specialist',
      'pressure_performer',
      'adaptation_expert'
    ],
    
    // Career Stats
    career: {
      championships: 3,
      wins: 54,
      podiums: 98,
      polePositions: 32,
      fastestLaps: 30,
      points: 2586.5,
      races: 185
    }
  },

  'lewis_hamilton': {
    id: 'lewis_hamilton',
    name: 'Lewis Hamilton',
    nationality: 'British',
    team: 'Mercedes',
    number: 44,
    age: 39,
    experience: 17,
    
    stats: {
      rawSpeed: 93,
      racecraft: 96,
      consistency: 94,
      wetWeather: 88,
      tireManagement: 96,
      fuelEfficiency: 94,
      overtaking: 89,
      defending: 95,
      qualifying: 91,
      starts: 92,
      pitstops: 93,
      adaptability: 88,
      pressure: 95,
      aggression: 82,
      patience: 90,
      technical: 95
    },
    
    drivingStyle: {
      preferredLine: 'smooth',
      corneringStyle: 'precise',
      throttleApplication: 'progressive',
      brakingStyle: 'smooth_and_late',
      riskTolerance: 'moderate',
      fuelSavingMode: 'excellent',
      tireConservation: 'excellent'
    },
    
    specialAbilities: [
      'tire_management_master',
      'race_strategy_expert',
      'consistency_king',
      'technical_feedback_expert'
    ],
    
    career: {
      championships: 7,
      wins: 103,
      podiums: 197,
      polePositions: 104,
      fastestLaps: 65,
      points: 4639.5,
      races: 332
    }
  },

  'charles_leclerc': {
    id: 'charles_leclerc',
    name: 'Charles Leclerc',
    nationality: 'Monegasque',
    team: 'Ferrari',
    number: 16,
    age: 26,
    experience: 6,
    
    stats: {
      rawSpeed: 94,
      racecraft: 89,
      consistency: 85,
      wetWeather: 86,
      tireManagement: 82,
      fuelEfficiency: 80,
      overtaking: 87,
      defending: 84,
      qualifying: 96,
      starts: 88,
      pitstops: 85,
      adaptability: 90,
      pressure: 88,
      aggression: 85,
      patience: 78,
      technical: 88
    },
    
    drivingStyle: {
      preferredLine: 'aggressive',
      corneringStyle: 'aggressive',
      throttleApplication: 'aggressive',
      brakingStyle: 'late_and_hard',
      riskTolerance: 'high',
      fuelSavingMode: 'moderate',
      tireConservation: 'moderate'
    },
    
    specialAbilities: [
      'qualifying_specialist',
      'raw_speed_demon',
      'adaptation_expert',
      'pressure_performer'
    ],
    
    career: {
      championships: 0,
      wins: 5,
      podiums: 30,
      polePositions: 23,
      fastestLaps: 7,
      points: 1084,
      races: 125
    }
  },

  'lando_norris': {
    id: 'lando_norris',
    name: 'Lando Norris',
    nationality: 'British',
    team: 'McLaren',
    number: 4,
    age: 24,
    experience: 5,
    
    stats: {
      rawSpeed: 90,
      racecraft: 88,
      consistency: 91,
      wetWeather: 85,
      tireManagement: 87,
      fuelEfficiency: 85,
      overtaking: 86,
      defending: 83,
      qualifying: 89,
      starts: 86,
      pitstops: 88,
      adaptability: 92,
      pressure: 87,
      aggression: 80,
      patience: 88,
      technical: 89
    },
    
    drivingStyle: {
      preferredLine: 'smooth',
      corneringStyle: 'precise',
      throttleApplication: 'smooth',
      brakingStyle: 'smooth',
      riskTolerance: 'moderate',
      fuelSavingMode: 'good',
      tireConservation: 'good'
    },
    
    specialAbilities: [
      'consistency_expert',
      'adaptation_specialist',
      'technical_feedback',
      'pressure_handler'
    ],
    
    career: {
      championships: 0,
      wins: 1,
      podiums: 13,
      polePositions: 1,
      fastestLaps: 6,
      points: 633,
      races: 105
    }
  },

  'oscar_piastri': {
    id: 'oscar_piastri',
    name: 'Oscar Piastri',
    nationality: 'Australian',
    team: 'McLaren',
    number: 81,
    age: 23,
    experience: 1,
    
    stats: {
      rawSpeed: 88,
      racecraft: 85,
      consistency: 89,
      wetWeather: 82,
      tireManagement: 84,
      fuelEfficiency: 83,
      overtaking: 84,
      defending: 81,
      qualifying: 87,
      starts: 83,
      pitstops: 85,
      adaptability: 94,
      pressure: 86,
      aggression: 78,
      patience: 90,
      technical: 87
    },
    
    drivingStyle: {
      preferredLine: 'smooth',
      corneringStyle: 'precise',
      throttleApplication: 'smooth',
      brakingStyle: 'smooth',
      riskTolerance: 'moderate',
      fuelSavingMode: 'good',
      tireConservation: 'good'
    },
    
    specialAbilities: [
      'rookie_adaptation',
      'consistency_expert',
      'technical_learner',
      'pressure_handler'
    ],
    
    career: {
      championships: 0,
      wins: 0,
      podiums: 2,
      polePositions: 0,
      fastestLaps: 0,
      points: 97,
      races: 22
    }
  },

  'george_russell': {
    id: 'george_russell',
    name: 'George Russell',
    nationality: 'British',
    team: 'Mercedes',
    number: 63,
    age: 26,
    experience: 5,
    
    stats: {
      rawSpeed: 89,
      racecraft: 87,
      consistency: 90,
      wetWeather: 84,
      tireManagement: 88,
      fuelEfficiency: 86,
      overtaking: 85,
      defending: 86,
      qualifying: 88,
      starts: 89,
      pitstops: 87,
      adaptability: 91,
      pressure: 89,
      aggression: 82,
      patience: 87,
      technical: 90
    },
    
    drivingStyle: {
      preferredLine: 'smooth',
      corneringStyle: 'precise',
      throttleApplication: 'progressive',
      brakingStyle: 'smooth',
      riskTolerance: 'moderate',
      fuelSavingMode: 'good',
      tireConservation: 'good'
    },
    
    specialAbilities: [
      'consistency_expert',
      'technical_feedback',
      'adaptation_specialist',
      'pressure_handler'
    ],
    
    career: {
      championships: 0,
      wins: 1,
      podiums: 11,
      polePositions: 1,
      fastestLaps: 4,
      points: 469,
      races: 105
    }
  },

  'carlos_sainz': {
    id: 'carlos_sainz',
    name: 'Carlos Sainz',
    nationality: 'Spanish',
    team: 'Ferrari',
    number: 55,
    age: 29,
    experience: 9,
    
    stats: {
      rawSpeed: 87,
      racecraft: 90,
      consistency: 92,
      wetWeather: 85,
      tireManagement: 89,
      fuelEfficiency: 88,
      overtaking: 88,
      defending: 89,
      qualifying: 85,
      starts: 87,
      pitstops: 90,
      adaptability: 88,
      pressure: 90,
      aggression: 83,
      patience: 91,
      technical: 91
    },
    
    drivingStyle: {
      preferredLine: 'smooth',
      corneringStyle: 'precise',
      throttleApplication: 'progressive',
      brakingStyle: 'smooth',
      riskTolerance: 'moderate',
      fuelSavingMode: 'excellent',
      tireConservation: 'excellent'
    },
    
    specialAbilities: [
      'consistency_king',
      'race_strategy_expert',
      'tire_management_master',
      'pressure_performer'
    ],
    
    career: {
      championships: 0,
      wins: 2,
      podiums: 18,
      polePositions: 5,
      fastestLaps: 3,
      points: 982.5,
      races: 185
    }
  },

  'fernando_alonso': {
    id: 'fernando_alonso',
    name: 'Fernando Alonso',
    nationality: 'Spanish',
    team: 'Aston Martin',
    number: 14,
    age: 42,
    experience: 20,
    
    stats: {
      rawSpeed: 88,
      racecraft: 98,
      consistency: 93,
      wetWeather: 92,
      tireManagement: 95,
      fuelEfficiency: 96,
      overtaking: 92,
      defending: 97,
      qualifying: 86,
      starts: 91,
      pitstops: 94,
      adaptability: 95,
      pressure: 97,
      aggression: 85,
      patience: 95,
      technical: 98
    },
    
    drivingStyle: {
      preferredLine: 'smooth',
      corneringStyle: 'precise',
      throttleApplication: 'progressive',
      brakingStyle: 'smooth',
      riskTolerance: 'moderate',
      fuelSavingMode: 'excellent',
      tireConservation: 'excellent'
    },
    
    specialAbilities: [
      'race_strategy_master',
      'tire_management_expert',
      'fuel_efficiency_king',
      'defensive_specialist',
      'experience_master'
    ],
    
    career: {
      championships: 2,
      wins: 32,
      podiums: 106,
      polePositions: 22,
      fastestLaps: 24,
      points: 2261,
      races: 377
    }
  },

  'sergio_perez': {
    id: 'sergio_perez',
    name: 'Sergio Perez',
    nationality: 'Mexican',
    team: 'Red Bull Racing',
    number: 11,
    age: 34,
    experience: 13,
    
    stats: {
      rawSpeed: 85,
      racecraft: 91,
      consistency: 88,
      wetWeather: 87,
      tireManagement: 93,
      fuelEfficiency: 92,
      overtaking: 90,
      defending: 88,
      qualifying: 82,
      starts: 88,
      pitstops: 91,
      adaptability: 89,
      pressure: 87,
      aggression: 84,
      patience: 92,
      technical: 88
    },
    
    drivingStyle: {
      preferredLine: 'smooth',
      corneringStyle: 'precise',
      throttleApplication: 'progressive',
      brakingStyle: 'smooth',
      riskTolerance: 'moderate',
      fuelSavingMode: 'excellent',
      tireConservation: 'excellent'
    },
    
    specialAbilities: [
      'tire_management_master',
      'fuel_efficiency_expert',
      'race_strategy_specialist',
      'consistency_expert'
    ],
    
    career: {
      championships: 0,
      wins: 6,
      podiums: 35,
      polePositions: 3,
      fastestLaps: 11,
      points: 1344,
      races: 257
    }
  },

  'valtteri_bottas': {
    id: 'valtteri_bottas',
    name: 'Valtteri Bottas',
    nationality: 'Finnish',
    team: 'Sauber',
    number: 77,
    age: 34,
    experience: 11,
    
    stats: {
      rawSpeed: 86,
      racecraft: 86,
      consistency: 91,
      wetWeather: 83,
      tireManagement: 87,
      fuelEfficiency: 85,
      overtaking: 83,
      defending: 85,
      qualifying: 88,
      starts: 87,
      pitstops: 86,
      adaptability: 87,
      pressure: 85,
      aggression: 79,
      patience: 89,
      technical: 87
    },
    
    drivingStyle: {
      preferredLine: 'smooth',
      corneringStyle: 'precise',
      throttleApplication: 'smooth',
      brakingStyle: 'smooth',
      riskTolerance: 'low',
      fuelSavingMode: 'good',
      tireConservation: 'good'
    },
    
    specialAbilities: [
      'consistency_expert',
      'qualifying_specialist',
      'technical_feedback',
      'pressure_handler'
    ],
    
    career: {
      championships: 0,
      wins: 10,
      podiums: 67,
      polePositions: 20,
      fastestLaps: 19,
      points: 1797,
      races: 220
    }
  }
};

/**
 * Get driver by ID
 */
export function getDriver(driverId) {
  return F1_DRIVERS[driverId] || null;
}

/**
 * Get all drivers
 */
export function getAllDrivers() {
  return Object.values(F1_DRIVERS);
}

/**
 * Get drivers by team
 */
export function getDriversByTeam(team) {
  return Object.values(F1_DRIVERS).filter(driver => driver.team === team);
}

/**
 * Get drivers by nationality
 */
export function getDriversByNationality(nationality) {
  return Object.values(F1_DRIVERS).filter(driver => driver.nationality === nationality);
}

/**
 * Get top drivers by stat
 */
export function getTopDriversByStat(stat, limit = 10) {
  return Object.values(F1_DRIVERS)
    .sort((a, b) => b.stats[stat] - a.stats[stat])
    .slice(0, limit);
}

/**
 * Calculate driver compatibility with car
 */
export function calculateDriverCarCompatibility(driverId, carSpecs) {
  const driver = getDriver(driverId);
  if (!driver) return 0;
  
  // Weight different stats based on car characteristics
  const weights = {
    rawSpeed: carSpecs.powerLevel * 0.3,
    consistency: carSpecs.reliability * 0.2,
    tireManagement: carSpecs.tireDegradation * 0.2,
    fuelEfficiency: carSpecs.fuelConsumption * 0.15,
    technical: carSpecs.complexity * 0.15
  };
  
  let compatibility = 0;
  let totalWeight = 0;
  
  for (const [stat, weight] of Object.entries(weights)) {
    compatibility += driver.stats[stat] * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? compatibility / totalWeight : 0;
}
