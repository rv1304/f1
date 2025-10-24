/**
 * VelocityForge Demo Scenario
 * 
 * A simple demo scenario showcasing basic agent behaviors and physics.
 */

import { Vector3 } from '../utils/Vector3.js';

export function createDemoScenario() {
  return {
    name: 'VelocityForge Demo',
    description: 'A simple demo scenario with racing agents',
    
    // World bounds
    bounds: {
      min: new Vector3(-100, -10, -100),
      max: new Vector3(100, 10, 100)
    },
    
    // Agent configurations
    agents: [
      // Racing agents
      {
        id: 'racer_1',
        name: 'Speed Demon',
        type: 'racer',
        position: { x: -50, y: 0, z: 0 },
        mass: 1.0,
        radius: 0.5,
        maxSpeed: 15.0,
        acceleration: 8.0,
        behavior: 'race',
        traits: {
          aggression: 0.8,
          fuelEfficiency: 0.7
        }
      },
      {
        id: 'racer_2',
        name: 'Eco Cruiser',
        type: 'racer',
        position: { x: -40, y: 0, z: 0 },
        mass: 1.0,
        radius: 0.5,
        maxSpeed: 12.0,
        acceleration: 6.0,
        behavior: 'cruise',
        traits: {
          aggression: 0.3,
          fuelEfficiency: 0.9
        }
      },
      {
        id: 'racer_3',
        name: 'Balanced Runner',
        type: 'racer',
        position: { x: -30, y: 0, z: 0 },
        mass: 1.0,
        radius: 0.5,
        maxSpeed: 13.0,
        acceleration: 7.0,
        behavior: 'race',
        traits: {
          aggression: 0.5,
          fuelEfficiency: 0.8
        }
      },
      
      // Patrol agents
      {
        id: 'patrol_1',
        name: 'Guardian',
        type: 'patrol',
        position: { x: 0, y: 0, z: -50 },
        mass: 1.0,
        radius: 0.5,
        maxSpeed: 10.0,
        acceleration: 5.0,
        behavior: 'patrol',
        waypoints: [
          { x: 0, y: 0, z: -50 },
          { x: 50, y: 0, z: -50 },
          { x: 50, y: 0, z: 50 },
          { x: -50, y: 0, z: 50 },
          { x: -50, y: 0, z: -50 }
        ],
        traits: {
          aggression: 0.2,
          fuelEfficiency: 0.85
        }
      },
      
      // Following agents
      {
        id: 'follower_1',
        name: 'Shadow',
        type: 'follower',
        position: { x: 20, y: 0, z: 0 },
        mass: 1.0,
        radius: 0.5,
        maxSpeed: 12.0,
        acceleration: 6.0,
        behavior: 'follow',
        traits: {
          aggression: 0.4,
          fuelEfficiency: 0.8
        }
      }
    ],
    
    // Environment settings
    environment: {
      gravity: { x: 0, y: -9.81, z: 0 },
      airDensity: 1.225,
      wind: { x: 0, y: 0, z: 0 }
    },
    
    // Scenario-specific settings
    settings: {
      maxDuration: 300, // 5 minutes
      enableCollisions: true,
      enableIncidents: true,
      incidentProbability: 0.01, // 1% chance per frame
      weatherEffects: false
    }
  };
}

export function createF1Scenario() {
  return {
    name: 'Formula 1 Circuit',
    description: 'A Formula 1-style racing scenario',
    
    bounds: {
      min: new Vector3(-200, -10, -200),
      max: new Vector3(200, 10, 200)
    },
    
    agents: [
      // F1 cars
      {
        id: 'f1_1',
        name: 'Red Bull Racing',
        type: 'f1',
        position: { x: -100, y: 0, z: 0 },
        mass: 0.8,
        radius: 0.4,
        maxSpeed: 20.0,
        acceleration: 10.0,
        behavior: 'race',
        traits: {
          aggression: 0.9,
          fuelEfficiency: 0.6,
          downforce: 0.8
        }
      },
      {
        id: 'f1_2',
        name: 'Mercedes AMG',
        type: 'f1',
        position: { x: -90, y: 0, z: 0 },
        mass: 0.8,
        radius: 0.4,
        maxSpeed: 19.5,
        acceleration: 9.5,
        behavior: 'race',
        traits: {
          aggression: 0.85,
          fuelEfficiency: 0.65,
          downforce: 0.85
        }
      },
      {
        id: 'f1_3',
        name: 'Ferrari',
        type: 'f1',
        position: { x: -80, y: 0, z: 0 },
        mass: 0.8,
        radius: 0.4,
        maxSpeed: 20.2,
        acceleration: 10.2,
        behavior: 'race',
        traits: {
          aggression: 0.95,
          fuelEfficiency: 0.55,
          downforce: 0.75
        }
      }
    ],
    
    environment: {
      gravity: { x: 0, y: -9.81, z: 0 },
      airDensity: 1.225,
      wind: { x: 0, y: 0, z: 0 }
    },
    
    settings: {
      maxDuration: 600, // 10 minutes
      enableCollisions: true,
      enableIncidents: true,
      incidentProbability: 0.005, // 0.5% chance per frame
      weatherEffects: true,
      pitStops: true
    }
  };
}

export function createDroneSwarmScenario() {
  return {
    name: 'Drone Swarm Race',
    description: 'A drone swarm racing scenario',
    
    bounds: {
      min: new Vector3(-50, 0, -50),
      max: new Vector3(50, 20, 50)
    },
    
    agents: [
      // Drone swarm
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `drone_${i + 1}`,
        name: `Drone ${i + 1}`,
        type: 'drone',
        position: { 
          x: Math.random() * 100 - 50, 
          y: Math.random() * 10 + 5, 
          z: Math.random() * 100 - 50 
        },
        mass: 0.5,
        radius: 0.3,
        maxSpeed: 8.0,
        acceleration: 4.0,
        behavior: 'race',
        affectedByGravity: false,
        traits: {
          aggression: 0.3 + Math.random() * 0.4,
          fuelEfficiency: 0.8 + Math.random() * 0.2,
          sensorRange: 5.0
        }
      }))
    ],
    
    environment: {
      gravity: { x: 0, y: -2.0, z: 0 }, // Reduced gravity for drones
      airDensity: 1.225,
      wind: { x: 0, y: 0, z: 0 }
    },
    
    settings: {
      maxDuration: 180, // 3 minutes
      enableCollisions: true,
      enableIncidents: true,
      incidentProbability: 0.02, // 2% chance per frame
      weatherEffects: false,
      noFlyZones: true
    }
  };
}
