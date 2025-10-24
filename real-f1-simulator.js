/**
 * Real F1 Simulator - Formula 1 Grand Prix Simulation
 * 
 * A proper F1 simulator with real drivers, teams, and race scenarios
 * Features:
 * - Real F1 drivers and teams (2024/2025 season)
 * - Live leaderboard with actual driver names
 * - Real-time race events (pit stops, incidents, weather)
 * - Proper F1 race scenarios and tracks
 */

import { EventEmitter } from 'events';

class RealF1Simulator extends EventEmitter {
  constructor() {
    super();
    
    this.isRunning = false;
    this.drivers = [];
    this.leaderboard = [];
    this.events = [];
    this.track = null;
    this.updateInterval = null;
    
    // Race state
    this.raceState = {
      time: 0,
      lap: 0,
      totalLaps: 0,
      weather: 'clear',
      temperature: 25,
      incidents: 0,
      safetyCar: false,
      redFlag: false
    };
    
    // Performance tracking
    this.stats = {
      fps: 0,
      lastUpdate: 0,
      frameCount: 0,
      startTime: Date.now()
    };
  }

  /**
   * Real F1 drivers and teams data (2024/2025 season)
   */
  getF1Drivers() {
    return [
      // Red Bull Racing
      { id: 1, name: 'Max VERSTAPPEN', team: 'Red Bull Racing', number: 1, nationality: 'NED', color: '🔴' },
      { id: 2, name: 'Sergio PEREZ', team: 'Red Bull Racing', number: 11, nationality: 'MEX', color: '🔴' },
      
      // Ferrari
      { id: 3, name: 'Charles LECLERC', team: 'Ferrari', number: 16, nationality: 'MON', color: '🔴' },
      { id: 4, name: 'Carlos SAINZ', team: 'Ferrari', number: 55, nationality: 'ESP', color: '🔴' },
      
      // McLaren
      { id: 5, name: 'Lando NORRIS', team: 'McLaren', number: 4, nationality: 'GBR', color: '🟠' },
      { id: 6, name: 'Oscar PIASTRI', team: 'McLaren', number: 81, nationality: 'AUS', color: '🟠' },
      
      // Mercedes
      { id: 7, name: 'Lewis HAMILTON', team: 'Mercedes', number: 44, nationality: 'GBR', color: '🔵' },
      { id: 8, name: 'George RUSSELL', team: 'Mercedes', number: 63, nationality: 'GBR', color: '🔵' },
      
      // Aston Martin
      { id: 9, name: 'Fernando ALONSO', team: 'Aston Martin', number: 14, nationality: 'ESP', color: '🟢' },
      { id: 10, name: 'Lance STROLL', team: 'Aston Martin', number: 18, nationality: 'CAN', color: '🟢' },
      
      // Alpine
      { id: 11, name: 'Pierre GASLY', team: 'Alpine', number: 10, nationality: 'FRA', color: '🟣' },
      { id: 12, name: 'Esteban OCON', team: 'Alpine', number: 31, nationality: 'FRA', color: '🟣' },
      
      // Williams
      { id: 13, name: 'Alexander ALBON', team: 'Williams', number: 23, nationality: 'THA', color: '🔵' },
      { id: 14, name: 'Logan SARGEANT', team: 'Williams', number: 2, nationality: 'USA', color: '🔵' },
      
      // AlphaTauri
      { id: 15, name: 'Yuki TSUNODA', team: 'AlphaTauri', number: 22, nationality: 'JPN', color: '🔵' },
      { id: 16, name: 'Daniel RICCIARDO', team: 'AlphaTauri', number: 3, nationality: 'AUS', color: '🔵' },
      
      // Alfa Romeo
      { id: 17, name: 'Valtteri BOTTAS', team: 'Alfa Romeo', number: 77, nationality: 'FIN', color: '🔴' },
      { id: 18, name: 'Zhou GUANYU', team: 'Alfa Romeo', number: 24, nationality: 'CHN', color: '🔴' },
      
      // Haas
      { id: 19, name: 'Kevin MAGNUSSEN', team: 'Haas', number: 20, nationality: 'DEN', color: '⚫' },
      { id: 20, name: 'Nico HULKENBERG', team: 'Haas', number: 27, nationality: 'GER', color: '⚫' }
    ];
  }

  /**
   * F1 tracks data
   */
  getF1Tracks() {
    return {
      monaco: {
        name: 'Monaco Grand Prix',
        location: 'Monte Carlo, Monaco',
        length: 3.337, // km
        laps: 78,
        icon: '🏎️'
      },
      silverstone: {
        name: 'British Grand Prix',
        location: 'Silverstone, UK',
        length: 5.891, // km
        laps: 52,
        icon: '🏁'
      },
      spa: {
        name: 'Belgian Grand Prix',
        location: 'Spa-Francorchamps, Belgium',
        length: 7.004, // km
        laps: 44,
        icon: '🌲'
      },
      monza: {
        name: 'Italian Grand Prix',
        location: 'Monza, Italy',
        length: 5.793, // km
        laps: 53,
        icon: '🇮🇹'
      },
      interlagos: {
        name: 'Brazilian Grand Prix',
        location: 'São Paulo, Brazil',
        length: 4.309, // km
        laps: 71,
        icon: '🇧🇷'
      }
    };
  }

  /**
   * Initialize the F1 simulator
   */
  initialize(trackId = 'monaco') {
    console.log('🏎️ Initializing Real F1 Simulator...');
    
    // Set up track
    const tracks = this.getF1Tracks();
    this.track = tracks[trackId] || tracks.monaco;
    this.raceState.totalLaps = this.track.laps;
    
    // Set up drivers
    this.drivers = this.getF1Drivers().map(driver => ({
      ...driver,
      position: 0, // km
      speed: 0, // km/h
      maxSpeed: 280 + Math.random() * 40, // km/h (realistic F1 speeds)
      acceleration: 0.8 + Math.random() * 0.4,
      lap: 0,
      totalTime: 0,
      bestLapTime: Infinity,
      currentLapTime: 0,
      status: 'racing',
      fuel: 100,
      tireWear: 0,
      incidents: 0,
      overtakes: 0,
      pitStops: 0,
      gridPosition: driver.id,
      gapToLeader: 0
    }));
    
    // Sort by grid position
    this.drivers.sort((a, b) => a.gridPosition - b.gridPosition);
    
    this.setupEventSystem();
    
    console.log(`✅ F1 Simulator initialized with ${this.drivers.length} drivers at ${this.track.name}`);
    return true;
  }

  /**
   * Setup event system
   */
  setupEventSystem() {
    this.events = [];
    
    // Schedule random events
    this.scheduleEvent('weather_change', 30000); // 30 seconds
    this.scheduleEvent('incident', 45000); // 45 seconds
    this.scheduleEvent('overtake', 15000); // 15 seconds
    this.scheduleEvent('pit_stop', 60000); // 60 seconds
    this.scheduleEvent('safety_car', 120000); // 2 minutes
  }

  /**
   * Schedule an event
   */
  scheduleEvent(type, delay) {
    setTimeout(() => {
      if (this.isRunning) {
        this.triggerEvent(type);
        this.scheduleEvent(type, delay + Math.random() * 10000);
      }
    }, delay);
  }

  /**
   * Trigger an event
   */
  triggerEvent(type) {
    const event = {
      type,
      time: this.raceState.time,
      description: this.getEventDescription(type),
      driver: null
    };
    
    switch (type) {
      case 'weather_change':
        this.changeWeather();
        event.description = `Weather changed to ${this.raceState.weather}`;
        break;
        
      case 'incident':
        const incidentDriver = this.drivers[Math.floor(Math.random() * this.drivers.length)];
        incidentDriver.incidents++;
        incidentDriver.speed *= 0.7; // Slow down
        event.driver = incidentDriver.name;
        this.raceState.incidents++;
        break;
        
      case 'overtake':
        const overtakingDriver = this.drivers[Math.floor(Math.random() * this.drivers.length)];
        overtakingDriver.overtakes++;
        event.driver = overtakingDriver.name;
        break;
        
      case 'pit_stop':
        const pitDriver = this.drivers[Math.floor(Math.random() * this.drivers.length)];
        pitDriver.pitStops++;
        pitDriver.fuel = 100;
        pitDriver.tireWear = 0;
        event.driver = pitDriver.name;
        break;
        
      case 'safety_car':
        this.raceState.safetyCar = true;
        event.description = 'Safety Car deployed';
        setTimeout(() => {
          this.raceState.safetyCar = false;
        }, 30000); // 30 seconds
        break;
    }
    
    this.events.push(event);
    this.emit('event', event);
  }

  /**
   * Get event description
   */
  getEventDescription(type) {
    const descriptions = {
      weather_change: 'Weather conditions changed',
      incident: 'Incident occurred',
      overtake: 'Overtaking maneuver',
      pit_stop: 'Pit stop completed',
      safety_car: 'Safety Car deployed'
    };
    
    return descriptions[type] || 'Unknown event';
  }

  /**
   * Change weather
   */
  changeWeather() {
    const weathers = ['clear', 'cloudy', 'rain', 'storm'];
    this.raceState.weather = weathers[Math.floor(Math.random() * weathers.length)];
    
    // Adjust temperature based on weather
    switch (this.raceState.weather) {
      case 'rain':
        this.raceState.temperature = 15 + Math.random() * 10;
        break;
      case 'storm':
        this.raceState.temperature = 10 + Math.random() * 8;
        break;
      default:
        this.raceState.temperature = 20 + Math.random() * 15;
    }
  }

  /**
   * Start the F1 race
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ F1 race is already running');
      return;
    }
    
    console.log('🏁 Starting F1 Grand Prix...');
    this.isRunning = true;
    this.stats.startTime = Date.now();
    
    // Start race loop (slower for more realistic progression)
    this.updateInterval = setInterval(() => {
      this.update();
    }, 200); // 5 FPS for more realistic progression
    
    // Display initial state
    this.displayRace();
    
    console.log('✅ F1 Grand Prix started successfully');
  }

  /**
   * Update race simulation
   */
  update() {
    const now = Date.now();
    const deltaTime = (now - this.stats.lastUpdate) / 1000;
    this.stats.lastUpdate = now;
    this.stats.frameCount++;
    
    // Update race state
    this.raceState.time += deltaTime;
    
    // Update drivers
    this.drivers.forEach(driver => {
      this.updateDriver(driver, deltaTime);
    });
    
    // Update leaderboard
    this.updateLeaderboard();
    
    // Update FPS
    if (this.stats.frameCount % 10 === 0) {
      this.stats.fps = Math.round(10 / deltaTime);
    }
    
    // Display race every 3 seconds for more realistic pacing
    if (this.stats.frameCount % 15 === 0) {
      this.displayRace();
    }
    
    // Check if race is finished
    const finishedDrivers = this.drivers.filter(d => d.status === 'finished');
    if (finishedDrivers.length >= 10) { // Race ends when 10 drivers finish
      this.stop();
    }
  }

  /**
   * Update individual driver
   */
  updateDriver(driver, deltaTime) {
    if (driver.status !== 'racing') return;
    
    // Calculate speed based on weather and conditions
    let targetSpeed = driver.maxSpeed;
    
    // Weather effects
    switch (this.raceState.weather) {
      case 'rain':
        targetSpeed *= 0.8;
        break;
      case 'storm':
        targetSpeed *= 0.6;
        break;
      case 'cloudy':
        targetSpeed *= 0.95;
        break;
    }
    
    // Safety car effects
    if (this.raceState.safetyCar) {
      targetSpeed *= 0.5;
    }
    
    // Tire wear effects
    targetSpeed *= (1 - driver.tireWear / 200);
    
    // Fuel effects
    if (driver.fuel < 20) {
      targetSpeed *= 0.9;
    }
    
    // Update speed
    const speedDiff = targetSpeed - driver.speed;
    driver.speed += speedDiff * driver.acceleration * deltaTime;
    driver.speed = Math.max(0, driver.speed);
    
    // Update position (fix speed calculation)
    const distance = (driver.speed * deltaTime) / 3600; // Convert km/h to km/s
    driver.position += distance;
    driver.totalTime += deltaTime;
    driver.currentLapTime += deltaTime;
    
    // Cap speed to realistic F1 speeds (max 350 km/h)
    driver.speed = Math.min(driver.speed, 350);
    
    // Check for lap completion
    if (driver.position >= this.track.length) {
      driver.lap++;
      driver.position = 0;
      
      // Update best lap time (realistic F1 lap times)
      if (driver.currentLapTime > 0 && driver.currentLapTime < driver.bestLapTime) {
        driver.bestLapTime = driver.currentLapTime;
      }
      
      driver.currentLapTime = 0;
      
      // Check if race is finished
      if (driver.lap >= this.raceState.totalLaps) {
        driver.status = 'finished';
      }
      
      // Update race state with current leader's lap
      this.raceState.lap = Math.max(this.raceState.lap, driver.lap);
    }
    
    // Update fuel and tire wear
    driver.fuel -= deltaTime * 0.5;
    driver.tireWear += deltaTime * 0.3;
    
    // Check for pit stop
    if (driver.fuel < 10 || driver.tireWear > 80) {
      driver.status = 'pitting';
      setTimeout(() => {
        driver.status = 'racing';
        driver.fuel = 100;
        driver.tireWear = 0;
      }, 3000); // 3 second pit stop
    }
  }

  /**
   * Update leaderboard
   */
  updateLeaderboard() {
    // Sort drivers by position and lap
    this.leaderboard = [...this.drivers].sort((a, b) => {
      if (a.lap !== b.lap) return b.lap - a.lap;
      return b.position - a.position;
    });
    
    // Calculate gaps to leader
    const leader = this.leaderboard[0];
    if (leader) {
      this.leaderboard.forEach((driver, index) => {
        if (index === 0) {
          driver.gapToLeader = 0;
        } else {
          // Simplified gap calculation
          driver.gapToLeader = (leader.lap - driver.lap) * this.track.length + (leader.position - driver.position);
        }
      });
    }
  }

  /**
   * Display race information
   */
  displayRace() {
    // Clear screen
    console.clear();
    
    // Header
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log(`║                    🏎️ ${this.track.name.toUpperCase()} 🏎️                    ║`);
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    
    // Race info
    console.log(`\n⏰ Time: ${this.formatTime(this.raceState.time)} | 🏁 Lap: ${this.raceState.lap}/${this.raceState.totalLaps} | 🌤️ Weather: ${this.raceState.weather} (${this.raceState.temperature.toFixed(1)}°C)`);
    console.log(`📊 FPS: ${this.stats.fps} | 🚨 Incidents: ${this.raceState.incidents} | 📡 Events: ${this.events.length}`);
    
    if (this.raceState.safetyCar) {
      console.log('🚨 SAFETY CAR DEPLOYED!');
    }
    
    // Leaderboard
    console.log('\n🏆 LIVE LEADERBOARD:');
    console.log('┌─────┬─────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
    console.log('│ Pos │ Driver          │ Team        │ Lap         │ Position    │ Speed       │');
    console.log('├─────┼─────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
    
    this.leaderboard.slice(0, 15).forEach((driver, index) => {
      const pos = index + 1;
      const name = driver.name.padEnd(15);
      const team = driver.team.padEnd(11);
      const lap = driver.lap.toString().padStart(3);
      const position = `${driver.position.toFixed(2)}km`.padStart(8);
      const speed = `${driver.speed.toFixed(0)}km/h`.padStart(8);
      const icon = driver.color;
      
      console.log(`│ ${pos.toString().padStart(3)} │ ${icon} ${name} │ ${team} │ ${lap} │ ${position} │ ${speed} │`);
    });
    
    console.log('└─────┴─────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘');
    
    // Recent events
    if (this.events.length > 0) {
      console.log('\n📡 RECENT EVENTS:');
      this.events.slice(-5).forEach(event => {
        const time = this.formatTime(event.time);
        const driver = event.driver ? ` (${event.driver})` : '';
        console.log(`   ${time} - ${event.description}${driver}`);
      });
    }
    
    // Statistics
    console.log('\n📊 RACE STATISTICS:');
    const leader = this.leaderboard[0];
    if (leader) {
      console.log(`   🥇 Leader: ${leader.name} (${leader.team}) - Lap ${leader.lap}, ${leader.speed.toFixed(0)}km/h`);
      const fastestLap = Math.min(...this.drivers.map(d => d.bestLapTime === Infinity ? 999999 : d.bestLapTime));
      if (fastestLap < 999999) {
        console.log(`   🏁 Fastest Lap: ${this.formatTime(fastestLap)}`);
      } else {
        console.log(`   🏁 Fastest Lap: No completed laps yet`);
      }
      console.log(`   🚨 Total Incidents: ${this.raceState.incidents}`);
      console.log(`   🔧 Total Pit Stops: ${this.drivers.reduce((sum, d) => sum + d.pitStops, 0)}`);
    }
    
    console.log('\n🎮 Controls: Ctrl+C to stop race');
  }

  /**
   * Format time
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  /**
   * Stop the race
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ F1 race is not running');
      return;
    }
    
    console.log('\n🏁 Stopping F1 race...');
    this.isRunning = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    // Display final results
    this.displayFinalResults();
    
    console.log('✅ F1 race stopped');
  }

  /**
   * Display final results
   */
  displayFinalResults() {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                              🏁 FINAL RESULTS 🏁                           ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    
    console.log(`\n⏰ Total Race Time: ${this.formatTime(this.raceState.time)}`);
    console.log(`🏁 Total Laps Completed: ${this.raceState.lap}`);
    console.log(`🚨 Total Incidents: ${this.raceState.incidents}`);
    console.log(`📡 Total Events: ${this.events.length}`);
    
    console.log('\n🏆 FINAL LEADERBOARD:');
    console.log('┌─────┬─────────────────┬─────────────┬─────────────┬─────────────┐');
    console.log('│ Pos │ Driver          │ Team        │ Total Time  │ Best Lap    │');
    console.log('├─────┼─────────────────┼─────────────┼─────────────┼─────────────┤');
    
    this.leaderboard.slice(0, 10).forEach((driver, index) => {
      const pos = index + 1;
      const name = driver.name.padEnd(15);
      const team = driver.team.padEnd(11);
      const totalTime = this.formatTime(driver.totalTime);
      const bestLap = driver.bestLapTime === Infinity ? 'N/A' : this.formatTime(driver.bestLapTime);
      const icon = driver.color;
      
      console.log(`│ ${pos.toString().padStart(3)} │ ${icon} ${name} │ ${team} │ ${totalTime} │ ${bestLap} │`);
    });
    
    console.log('└─────┴─────────────────┴─────────────┴─────────────┴─────────────┘');
    
    console.log('\n🎉 Thank you for watching the F1 Grand Prix!');
  }

  /**
   * Get race status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      track: this.track,
      drivers: this.drivers.length,
      time: this.raceState.time,
      leaderboard: this.leaderboard.slice(0, 5),
      events: this.events.slice(-5),
      stats: this.stats
    };
  }
}

// Main execution
async function main() {
  const simulator = new RealF1Simulator();
  
  // Get track from command line or default to Monaco
  const trackId = process.argv[2] || 'monaco';
  
  // Initialize simulator
  const initialized = simulator.initialize(trackId);
  if (!initialized) {
    console.error('❌ Failed to initialize F1 simulator');
    process.exit(1);
  }
  
  // Start race
  simulator.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, stopping race...');
    simulator.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, stopping race...');
    simulator.stop();
    process.exit(0);
  });
  
  // Keep the process alive
  setInterval(() => {
    // Keep alive
  }, 1000);
}

// Run the simulator
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ F1 simulator failed:', error);
    process.exit(1);
  });
}

export { RealF1Simulator };
