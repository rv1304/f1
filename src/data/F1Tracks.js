/**
 * VelocityForge F1 Tracks Database
 * 
 * Comprehensive database of F1 circuits with realistic layouts,
 * sectors, DRS zones, and track characteristics.
 */

export const F1_TRACKS = {
  'monaco': {
    id: 'monaco',
    name: 'Circuit de Monaco',
    location: 'Monte Carlo, Monaco',
    country: 'Monaco',
    length: 3.337, // km
    corners: 19,
    elevation: 7.6, // meters
    direction: 'clockwise',
    
    // Track Layout
    layout: {
      type: 'street_circuit',
      width: 7.0, // meters average
      surface: 'asphalt',
      gripLevel: 85, // 0-100
      surfaceRoughness: 0.8, // 0-1 (higher = rougher)
      temperatureSensitivity: 90 // 0-100
    },
    
    // Sectors
    sectors: [
      {
        number: 1,
        start: 0,
        end: 0.33,
        length: 1.1,
        corners: 6,
        characteristics: ['technical', 'narrow', 'elevation_change'],
        difficulty: 95
      },
      {
        number: 2,
        start: 0.33,
        end: 0.66,
        length: 1.1,
        corners: 7,
        characteristics: ['technical', 'slow_corners', 'precision'],
        difficulty: 98
      },
      {
        number: 3,
        start: 0.66,
        end: 1.0,
        length: 1.137,
        corners: 6,
        characteristics: ['technical', 'tunnel', 'harbor'],
        difficulty: 92
      }
    ],
    
    // DRS Zones
    drsZones: [
      {
        number: 1,
        start: 0.95, // Start of main straight
        end: 0.05,   // End of main straight
        length: 0.1,
        speedGain: 15 // km/h
      }
    ],
    
    // Key Corners
    corners: [
      { name: 'Sainte Dévote', sector: 1, difficulty: 85, speed: 45 },
      { name: 'Beau Rivage', sector: 1, difficulty: 80, speed: 120 },
      { name: 'Massenet', sector: 1, difficulty: 90, speed: 60 },
      { name: 'Casino', sector: 1, difficulty: 95, speed: 40 },
      { name: 'Mirabeau', sector: 2, difficulty: 98, speed: 35 },
      { name: 'Grand Hotel Hairpin', sector: 2, difficulty: 100, speed: 25 },
      { name: 'Portier', sector: 2, difficulty: 88, speed: 50 },
      { name: 'Tunnel', sector: 3, difficulty: 75, speed: 180 },
      { name: 'Tabac', sector: 3, difficulty: 92, speed: 45 },
      { name: 'Piscine', sector: 3, difficulty: 90, speed: 40 },
      { name: 'Rascasse', sector: 3, difficulty: 88, speed: 35 },
      { name: 'Anthony Noghes', sector: 3, difficulty: 85, speed: 30 }
    ],
    
    // Track Characteristics
    characteristics: {
      overtakingDifficulty: 100, // 0-100 (higher = harder)
      tireDegradation: 60, // 0-100
      fuelConsumption: 70, // 0-100
      brakeWear: 80, // 0-100
      setupSensitivity: 95, // 0-100
      weatherImpact: 85, // 0-100
      safetyCarProbability: 0.3 // 0-1
    },
    
    // Lap Records
    records: {
      qualifying: { time: 70.365, driver: 'Max Verstappen', year: 2023 },
      race: { time: 72.647, driver: 'Lewis Hamilton', year: 2021 },
      fastestLap: { time: 72.647, driver: 'Lewis Hamilton', year: 2021 }
    }
  },

  'silverstone': {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    location: 'Silverstone, England',
    country: 'United Kingdom',
    length: 5.891, // km
    corners: 18,
    elevation: 18.0, // meters
    direction: 'clockwise',
    
    layout: {
      type: 'permanent_circuit',
      width: 14.0,
      surface: 'asphalt',
      gripLevel: 90,
      surfaceRoughness: 0.6,
      temperatureSensitivity: 75
    },
    
    sectors: [
      {
        number: 1,
        start: 0,
        end: 0.33,
        length: 1.95,
        corners: 6,
        characteristics: ['high_speed', 'flowing', 'elevation_change'],
        difficulty: 80
      },
      {
        number: 2,
        start: 0.33,
        end: 0.66,
        length: 1.95,
        corners: 6,
        characteristics: ['high_speed', 'technical', 'flowing'],
        difficulty: 85
      },
      {
        number: 3,
        start: 0.66,
        end: 1.0,
        length: 1.991,
        corners: 6,
        characteristics: ['high_speed', 'technical', 'flowing'],
        difficulty: 88
      }
    ],
    
    drsZones: [
      {
        number: 1,
        start: 0.85, // Wellington Straight
        end: 0.95,
        length: 0.1,
        speedGain: 20
      },
      {
        number: 2,
        start: 0.15, // Hangar Straight
        end: 0.25,
        length: 0.1,
        speedGain: 18
      }
    ],
    
    corners: [
      { name: 'Abbey', sector: 1, difficulty: 70, speed: 180 },
      { name: 'Farm', sector: 1, difficulty: 75, speed: 160 },
      { name: 'Village', sector: 1, difficulty: 80, speed: 140 },
      { name: 'The Loop', sector: 1, difficulty: 85, speed: 120 },
      { name: 'Aintree', sector: 1, difficulty: 80, speed: 130 },
      { name: 'Brooklands', sector: 1, difficulty: 85, speed: 110 },
      { name: 'Luffield', sector: 2, difficulty: 80, speed: 100 },
      { name: 'Woodcote', sector: 2, difficulty: 75, speed: 150 },
      { name: 'Copse', sector: 2, difficulty: 90, speed: 200 },
      { name: 'Maggotts', sector: 2, difficulty: 85, speed: 180 },
      { name: 'Becketts', sector: 2, difficulty: 95, speed: 160 },
      { name: 'Chapel', sector: 2, difficulty: 90, speed: 140 },
      { name: 'Hangar Straight', sector: 3, difficulty: 60, speed: 220 },
      { name: 'Stowe', sector: 3, difficulty: 85, speed: 120 },
      { name: 'Vale', sector: 3, difficulty: 80, speed: 100 },
      { name: 'Club', sector: 3, difficulty: 85, speed: 80 },
      { name: 'Abbey', sector: 3, difficulty: 70, speed: 180 },
      { name: 'Farm', sector: 3, difficulty: 75, speed: 160 }
    ],
    
    characteristics: {
      overtakingDifficulty: 60,
      tireDegradation: 80,
      fuelConsumption: 85,
      brakeWear: 70,
      setupSensitivity: 80,
      weatherImpact: 70,
      safetyCarProbability: 0.2
    },
    
    records: {
      qualifying: { time: 105.154, driver: 'Max Verstappen', year: 2023 },
      race: { time: 107.841, driver: 'Lewis Hamilton', year: 2020 },
      fastestLap: { time: 107.841, driver: 'Lewis Hamilton', year: 2020 }
    }
  },

  'spa': {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    location: 'Spa, Belgium',
    country: 'Belgium',
    length: 7.004, // km
    corners: 19,
    elevation: 102.0, // meters
    direction: 'clockwise',
    
    layout: {
      type: 'permanent_circuit',
      width: 12.0,
      surface: 'asphalt',
      gripLevel: 88,
      surfaceRoughness: 0.7,
      temperatureSensitivity: 80
    },
    
    sectors: [
      {
        number: 1,
        start: 0,
        end: 0.33,
        length: 2.33,
        corners: 6,
        characteristics: ['high_speed', 'elevation_change', 'flowing'],
        difficulty: 85
      },
      {
        number: 2,
        start: 0.33,
        end: 0.66,
        length: 2.33,
        corners: 7,
        characteristics: ['technical', 'elevation_change', 'flowing'],
        difficulty: 90
      },
      {
        number: 3,
        start: 0.66,
        end: 1.0,
        length: 2.344,
        corners: 6,
        characteristics: ['high_speed', 'technical', 'flowing'],
        difficulty: 88
      }
    ],
    
    drsZones: [
      {
        number: 1,
        start: 0.90, // Kemmel Straight
        end: 0.05,
        length: 0.1,
        speedGain: 25
      }
    ],
    
    corners: [
      { name: 'La Source', sector: 1, difficulty: 80, speed: 40 },
      { name: 'Eau Rouge', sector: 1, difficulty: 95, speed: 180 },
      { name: 'Raidillon', sector: 1, difficulty: 98, speed: 200 },
      { name: 'Kemmel Straight', sector: 1, difficulty: 60, speed: 220 },
      { name: 'Les Combes', sector: 2, difficulty: 85, speed: 120 },
      { name: 'Malmedy', sector: 2, difficulty: 80, speed: 140 },
      { name: 'Rivage', sector: 2, difficulty: 85, speed: 100 },
      { name: 'Pouhon', sector: 2, difficulty: 90, speed: 160 },
      { name: 'Fagnes', sector: 2, difficulty: 85, speed: 140 },
      { name: 'Stavelot', sector: 2, difficulty: 88, speed: 180 },
      { name: 'Blanchimont', sector: 3, difficulty: 85, speed: 200 },
      { name: 'Bus Stop', sector: 3, difficulty: 80, speed: 60 }
    ],
    
    characteristics: {
      overtakingDifficulty: 50,
      tireDegradation: 85,
      fuelConsumption: 90,
      brakeWear: 75,
      setupSensitivity: 85,
      weatherImpact: 95,
      safetyCarProbability: 0.4
    },
    
    records: {
      qualifying: { time: 103.665, driver: 'Max Verstappen', year: 2023 },
      race: { time: 106.391, driver: 'Lewis Hamilton', year: 2020 },
      fastestLap: { time: 106.391, driver: 'Lewis Hamilton', year: 2020 }
    }
  },

  'monza': {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    location: 'Monza, Italy',
    country: 'Italy',
    length: 5.793, // km
    corners: 11,
    elevation: 8.0, // meters
    direction: 'clockwise',
    
    layout: {
      type: 'permanent_circuit',
      width: 13.0,
      surface: 'asphalt',
      gripLevel: 85,
      surfaceRoughness: 0.8,
      temperatureSensitivity: 70
    },
    
    sectors: [
      {
        number: 1,
        start: 0,
        end: 0.33,
        length: 1.93,
        corners: 4,
        characteristics: ['high_speed', 'straight_line', 'flowing'],
        difficulty: 70
      },
      {
        number: 2,
        start: 0.33,
        end: 0.66,
        length: 1.93,
        corners: 4,
        characteristics: ['high_speed', 'technical', 'flowing'],
        difficulty: 80
      },
      {
        number: 3,
        start: 0.66,
        end: 1.0,
        length: 1.933,
        corners: 3,
        characteristics: ['high_speed', 'technical', 'flowing'],
        difficulty: 85
      }
    ],
    
    drsZones: [
      {
        number: 1,
        start: 0.85, // Start/finish straight
        end: 0.95,
        length: 0.1,
        speedGain: 22
      },
      {
        number: 2,
        start: 0.15, // Back straight
        end: 0.25,
        length: 0.1,
        speedGain: 20
      }
    ],
    
    corners: [
      { name: 'Rettifilo', sector: 1, difficulty: 60, speed: 220 },
      { name: 'Curva Grande', sector: 1, difficulty: 75, speed: 200 },
      { name: 'Roggia', sector: 1, difficulty: 80, speed: 120 },
      { name: 'Lesmo 1', sector: 1, difficulty: 85, speed: 140 },
      { name: 'Lesmo 2', sector: 2, difficulty: 85, speed: 140 },
      { name: 'Ascari', sector: 2, difficulty: 90, speed: 160 },
      { name: 'Parabolica', sector: 3, difficulty: 95, speed: 180 }
    ],
    
    characteristics: {
      overtakingDifficulty: 40,
      tireDegradation: 90,
      fuelConsumption: 95,
      brakeWear: 60,
      setupSensitivity: 75,
      weatherImpact: 60,
      safetyCarProbability: 0.15
    },
    
    records: {
      qualifying: { time: 80.161, driver: 'Carlos Sainz', year: 2023 },
      race: { time: 82.446, driver: 'Lewis Hamilton', year: 2020 },
      fastestLap: { time: 82.446, driver: 'Lewis Hamilton', year: 2020 }
    }
  }
};

/**
 * Get track by ID
 */
export function getTrack(trackId) {
  return F1_TRACKS[trackId] || null;
}

/**
 * Get all tracks
 */
export function getAllTracks() {
  return Object.values(F1_TRACKS);
}

/**
 * Get tracks by country
 */
export function getTracksByCountry(country) {
  return Object.values(F1_TRACKS).filter(track => track.country === country);
}

/**
 * Calculate track difficulty
 */
export function calculateTrackDifficulty(trackId) {
  const track = getTrack(trackId);
  if (!track) return 0;
  
  const sectorDifficulty = track.sectors.reduce((sum, sector) => sum + sector.difficulty, 0) / track.sectors.length;
  const cornerDifficulty = track.corners.reduce((sum, corner) => sum + corner.difficulty, 0) / track.corners.length;
  const layoutDifficulty = track.layout.gripLevel;
  
  return (sectorDifficulty + cornerDifficulty + layoutDifficulty) / 3;
}

/**
 * Calculate overtaking opportunities
 */
export function calculateOvertakingOpportunities(trackId) {
  const track = getTrack(trackId);
  if (!track) return 0;
  
  const drsZones = track.drsZones.length;
  const trackWidth = track.layout.width;
  const difficulty = track.characteristics.overtakingDifficulty;
  
  // More DRS zones and wider track = more overtaking opportunities
  const opportunities = (drsZones * 20) + (trackWidth * 2) + (100 - difficulty);
  return Math.min(opportunities, 100);
}

/**
 * Calculate tire degradation factor
 */
export function calculateTireDegradationFactor(trackId, weather) {
  const track = getTrack(trackId);
  if (!track) return 1.0;
  
  const baseDegradation = track.characteristics.tireDegradation / 100;
  const surfaceRoughness = track.layout.surfaceRoughness;
  const temperatureFactor = weather.temperature / 30; // Normalize to 30°C
  
  return baseDegradation * surfaceRoughness * temperatureFactor;
}

/**
 * Calculate fuel consumption factor
 */
export function calculateFuelConsumptionFactor(trackId) {
  const track = getTrack(trackId);
  if (!track) return 1.0;
  
  return track.characteristics.fuelConsumption / 100;
}

/**
 * Get sector information
 */
export function getSectorInfo(trackId, sectorNumber) {
  const track = getTrack(trackId);
  if (!track) return null;
  
  return track.sectors.find(sector => sector.number === sectorNumber);
}

/**
 * Get DRS zones for track
 */
export function getDRSZones(trackId) {
  const track = getTrack(trackId);
  if (!track) return [];
  
  return track.drsZones;
}
