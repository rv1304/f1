/**
 * VelocityForge Physics Engine
 * 
 * Lightweight physics engine optimized for real-time multi-agent simulation.
 * Uses simplified kinematics with customizable dynamics for different agent types.
 */

import { Vector3 } from '../utils/Vector3.js';
import { CollisionDetector } from './CollisionDetector.js';

export class PhysicsEngine {
  constructor(timeStep = 1/60) {
    this.timeStep = timeStep;
    this.gravity = new Vector3(0, -9.81, 0); // Default gravity
    this.collisionDetector = new CollisionDetector();
    
    // Physics constants
    this.constants = {
      airDensity: 1.225, // kg/m³ at sea level
      dragCoefficient: 0.3,
      frictionCoefficient: 0.8,
      restitution: 0.6 // Bounciness factor
    };

    // World bounds
    this.bounds = {
      min: new Vector3(-1000, -100, -1000),
      max: new Vector3(1000, 100, 1000)
    };

    // Performance tracking
    this.stats = {
      collisionChecks: 0,
      physicsUpdates: 0,
      averageUpdateTime: 0
    };
  }

  /**
   * Initialize physics engine with world bounds
   */
  initialize(bounds) {
    if (bounds) {
      this.bounds = {
        min: new Vector3(bounds.min.x, bounds.min.y, bounds.min.z),
        max: new Vector3(bounds.max.x, bounds.max.y, bounds.max.z)
      };
    }
    
    console.log('🔬 Physics engine initialized');
  }

  /**
   * Update physics for all agents
   */
  update(agents, deltaTime) {
    const startTime = performance.now();
    
    // Update each agent's physics
    for (const agent of agents) {
      this.updateAgentPhysics(agent, deltaTime);
    }
    
    // Check for collisions
    this.checkCollisions(agents);
    
    // Update statistics
    this.stats.physicsUpdates++;
    const updateTime = performance.now() - startTime;
    this.stats.averageUpdateTime = (this.stats.averageUpdateTime * 0.9) + (updateTime * 0.1);
  }

  /**
   * Update physics for a single agent
   */
  updateAgentPhysics(agent, deltaTime) {
    if (!agent.physics) return;

    const physics = agent.physics;
    const position = physics.position;
    const velocity = physics.velocity;
    const acceleration = physics.acceleration;

    // Apply forces
    this.applyForces(agent, deltaTime);

    // Update velocity using acceleration
    velocity.add(acceleration.clone().multiplyScalar(deltaTime));

    // Apply drag
    this.applyDrag(agent, deltaTime);

    // Update position using velocity
    position.add(velocity.clone().multiplyScalar(deltaTime));

    // Apply world bounds constraints
    this.applyBoundsConstraints(agent);

    // Update agent's transform
    agent.updateTransform(position, velocity, acceleration);

    // Reset acceleration for next frame
    acceleration.set(0, 0, 0);
  }

  /**
   * Apply forces to an agent
   */
  applyForces(agent, deltaTime) {
    const physics = agent.physics;
    const acceleration = physics.acceleration;
    const mass = physics.mass;

    // Apply gravity (if agent is affected by it)
    if (physics.affectedByGravity) {
      acceleration.add(this.gravity);
    }

    // Apply thrust force
    if (physics.thrust) {
      const thrustForce = physics.thrust.clone().divideScalar(mass);
      acceleration.add(thrustForce);
    }

    // Apply friction
    if (physics.onGround) {
      this.applyFriction(agent, deltaTime);
    }

    // Apply custom forces from agent
    if (agent.getCustomForces) {
      const customForces = agent.getCustomForces();
      for (const force of customForces) {
        acceleration.add(force.clone().divideScalar(mass));
      }
    }
  }

  /**
   * Apply drag forces
   */
  applyDrag(agent, deltaTime) {
    const physics = agent.physics;
    const velocity = physics.velocity;
    const dragCoeff = physics.dragCoefficient || this.constants.dragCoefficient;
    
    // Calculate drag force: F = 0.5 * ρ * v² * Cd * A
    const speed = velocity.length();
    if (speed < 0.01) return; // Avoid division by zero

    const dragForce = 0.5 * this.constants.airDensity * speed * speed * dragCoeff * physics.crossSectionalArea;
    const dragAcceleration = dragForce / physics.mass;

    // Apply drag opposite to velocity direction
    const dragDirection = velocity.clone().normalize().multiplyScalar(-1);
    const dragVector = dragDirection.multiplyScalar(dragAcceleration * deltaTime);
    
    velocity.add(dragVector);
  }

  /**
   * Apply friction forces
   */
  applyFriction(agent, deltaTime) {
    const physics = agent.physics;
    const velocity = physics.velocity;
    const frictionCoeff = physics.frictionCoefficient || this.constants.frictionCoefficient;
    
    // Apply ground friction
    const frictionForce = physics.mass * this.gravity.length() * frictionCoeff;
    const frictionAcceleration = frictionForce / physics.mass;

    // Apply friction opposite to velocity direction
    const horizontalVelocity = new Vector3(velocity.x, 0, velocity.z);
    if (horizontalVelocity.length() > 0.01) {
      const frictionDirection = horizontalVelocity.normalize().multiplyScalar(-1);
      const frictionVector = frictionDirection.multiplyScalar(frictionAcceleration * deltaTime);
      
      velocity.add(frictionVector);
    }
  }

  /**
   * Apply world bounds constraints
   */
  applyBoundsConstraints(agent) {
    const physics = agent.physics;
    const position = physics.position;
    const velocity = physics.velocity;

    // Check X bounds
    if (position.x < this.bounds.min.x) {
      position.x = this.bounds.min.x;
      velocity.x = Math.abs(velocity.x) * this.constants.restitution;
    } else if (position.x > this.bounds.max.x) {
      position.x = this.bounds.max.x;
      velocity.x = -Math.abs(velocity.x) * this.constants.restitution;
    }

    // Check Y bounds
    if (position.y < this.bounds.min.y) {
      position.y = this.bounds.min.y;
      velocity.y = Math.abs(velocity.y) * this.constants.restitution;
      physics.onGround = true;
    } else if (position.y > this.bounds.max.y) {
      position.y = this.bounds.max.y;
      velocity.y = -Math.abs(velocity.y) * this.constants.restitution;
    } else {
      physics.onGround = false;
    }

    // Check Z bounds
    if (position.z < this.bounds.min.z) {
      position.z = this.bounds.min.z;
      velocity.z = Math.abs(velocity.z) * this.constants.restitution;
    } else if (position.z > this.bounds.max.z) {
      position.z = this.bounds.max.z;
      velocity.z = -Math.abs(velocity.z) * this.constants.restitution;
    }
  }

  /**
   * Check for collisions between agents
   */
  checkCollisions(agents) {
    this.stats.collisionChecks++;
    
    // Use spatial partitioning for efficient collision detection
    const collisions = this.collisionDetector.detectCollisions(agents);
    
    // Resolve collisions
    for (const collision of collisions) {
      this.resolveCollision(collision.agent1, collision.agent2, collision.impact);
    }
  }

  /**
   * Resolve collision between two agents
   */
  resolveCollision(agent1, agent2, impact) {
    const physics1 = agent1.physics;
    const physics2 = agent2.physics;
    
    const pos1 = physics1.position;
    const pos2 = physics2.position;
    const vel1 = physics1.velocity;
    const vel2 = physics2.velocity;
    
    // Calculate collision normal
    const collisionVector = pos2.clone().subtract(pos1);
    const distance = collisionVector.length();
    
    if (distance === 0) return; // Avoid division by zero
    
    const normal = collisionVector.normalize();
    
    // Calculate relative velocity
    const relativeVelocity = vel2.clone().subtract(vel1);
    const velocityAlongNormal = relativeVelocity.dot(normal);
    
    // Do not resolve if velocities are separating
    if (velocityAlongNormal > 0) return;
    
    // Calculate restitution
    const restitution = Math.min(physics1.restitution || this.constants.restitution, 
                                physics2.restitution || this.constants.restitution);
    
    // Calculate impulse scalar
    const impulseScalar = -(1 + restitution) * velocityAlongNormal;
    const totalMass = physics1.mass + physics2.mass;
    const impulse = impulseScalar / totalMass;
    
    // Apply impulse
    const impulseVector = normal.clone().multiplyScalar(impulse);
    
    vel1.subtract(impulseVector.clone().multiplyScalar(physics2.mass));
    vel2.add(impulseVector.clone().multiplyScalar(physics1.mass));
    
    // Separate agents to prevent overlap
    const separationDistance = (physics1.radius + physics2.radius) - distance;
    if (separationDistance > 0) {
      const separationVector = normal.clone().multiplyScalar(separationDistance * 0.5);
      pos1.subtract(separationVector);
      pos2.add(separationVector);
    }
    
    // Emit collision event
    if (agent1.onCollision) {
      agent1.onCollision(agent2, impact);
    }
    if (agent2.onCollision) {
      agent2.onCollision(agent1, impact);
    }
  }

  /**
   * Set gravity vector
   */
  setGravity(gravity) {
    this.gravity = new Vector3(gravity.x, gravity.y, gravity.z);
  }

  /**
   * Get physics statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.collisionDetector.destroy();
  }
}
