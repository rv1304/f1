/**
 * F1 Live Commentary System
 * 
 * Provides realistic F1-style commentary for the racing simulator
 * Works alongside the existing simulator without modifying core code
 */

import { EventEmitter } from 'events';

class F1CommentarySystem extends EventEmitter {
  constructor() {
    super();
    
    this.isActive = false;
    this.commentaryInterval = null;
    this.lastCommentaryTime = 0;
    this.commentaryDelay = 3000; // 3 seconds between commentaries
    this.currentRaceData = { lap: 0, totalLaps: 78, remaining: 78 };
    
    // Commentary data
    this.commentators = [
      { name: 'David Croft', style: 'excited', catchphrase: 'LIGHTS OUT AND AWAY WE GO!' },
      { name: 'Martin Brundle', style: 'technical', catchphrase: 'That was a brilliant move!' },
      { name: 'Karun Chandhok', style: 'analytical', catchphrase: 'The strategy is working perfectly!' },
      { name: 'Jenson Button', style: 'experienced', catchphrase: 'I know exactly how that feels!' }
    ];
    
    this.currentCommentator = this.commentators[0];
    
    // Commentary templates
    this.commentaryTemplates = {
      raceStart: [
        "🏁 LIGHTS OUT AND AWAY WE GO! The Monaco Grand Prix is underway!",
        "🚀 And we're racing! What a start to the Monaco Grand Prix!",
        "🏎️ The race is ON! Monaco is always full of drama!",
        "⚡ What a launch! The drivers are fighting for position!"
      ],
      
      overtaking: [
        "🔥 WHAT A MOVE! {driver} goes around the outside!",
        "💨 Brilliant overtaking! {driver} makes it stick!",
        "🎯 Perfect timing! {driver} gets the job done!",
        "⚡ Sensational move by {driver}! That's racing!",
        "🏁 {driver} with a textbook overtake!",
        "💫 {driver} showing their class with that move!"
      ],
      
      incidents: [
        "🚨 OH NO! {driver} has an incident!",
        "💥 That's a big moment for {driver}!",
        "⚠️ {driver} in trouble! That could be costly!",
        "🔥 Drama! {driver} has a problem!",
        "🚨 {driver} needs to be careful here!"
      ],
      
      pitStops: [
        "🔧 {driver} comes into the pits!",
        "⚡ Lightning fast pit stop for {driver}!",
        "🏁 {driver} with a perfect pit stop!",
        "🔧 {driver} in for fresh tires!",
        "⚡ That was a quick one for {driver}!"
      ],
      
      weather: [
        "🌧️ The rain is coming down! This changes everything!",
        "☀️ The sun is out! Track conditions are improving!",
        "🌤️ Weather is clearing up! Perfect racing conditions!",
        "🌧️ Wet weather! Drivers need to be extra careful!",
        "☀️ Beautiful conditions here in Monaco!"
      ],
      
      safetyCar: [
        "🚨 SAFETY CAR DEPLOYED! The race is neutralized!",
        "⚠️ Safety car period! This could shake up the strategy!",
        "🚨 Safety car out! The pack is bunched up!",
        "⚠️ Race control has deployed the safety car!"
      ],
      
      lapProgress: [
        "🏁 Lap {lap} of {totalLaps} here in Monaco!",
        "⏰ We're {lap} laps into this Monaco Grand Prix!",
        "🏎️ {lap} laps completed! The race is heating up!",
        "⏱️ {lap} laps down, {remaining} to go!"
      ],
      
      leaderChanges: [
        "🏆 NEW LEADER! {driver} takes the lead!",
        "🥇 {driver} is now in P1! What a drive!",
        "🏁 {driver} leads the Monaco Grand Prix!",
        "⚡ {driver} at the front! Can they hold on?"
      ],
      
      general: [
        "🏎️ Monaco is the crown jewel of Formula 1!",
        "🌊 The Mediterranean backdrop is stunning!",
        "🏁 This is what Formula 1 is all about!",
        "⚡ The atmosphere here is electric!",
        "🏎️ Monaco never fails to deliver drama!",
        "🌊 What a beautiful day for racing!",
        "🏁 The drivers are giving it everything!",
        "⚡ This is why we love Formula 1!"
      ]
    };
    
    this.lastEvents = {
      overtaking: null,
      incidents: null,
      pitStops: null,
      weather: null,
      safetyCar: null
    };
  }

  /**
   * Start the commentary system
   */
  start() {
    if (this.isActive) {
      console.log('🎤 Commentary system is already active');
      return;
    }
    
    console.log('🎤 Starting F1 Live Commentary System...');
    this.isActive = true;
    this.lastCommentaryTime = Date.now();
    
    // Start commentary loop
    this.commentaryInterval = setInterval(() => {
      this.generateCommentary();
    }, this.commentaryDelay);
    
    // Initial race start commentary
    setTimeout(() => {
      this.sayCommentary('raceStart');
    }, 2000);
    
    console.log('✅ F1 Live Commentary System started');
  }

  /**
   * Stop the commentary system
   */
  stop() {
    if (!this.isActive) {
      return;
    }
    
    console.log('🎤 Stopping F1 Live Commentary System...');
    this.isActive = false;
    
    if (this.commentaryInterval) {
      clearInterval(this.commentaryInterval);
      this.commentaryInterval = null;
    }
    
    console.log('✅ F1 Live Commentary System stopped');
  }

  /**
   * Generate commentary based on race events
   */
  generateCommentary() {
    if (!this.isActive) return;
    
    const now = Date.now();
    if (now - this.lastCommentaryTime < this.commentaryDelay) return;
    
    // Random commentary selection
    const commentaryTypes = ['general'];
    const randomType = commentaryTypes[Math.floor(Math.random() * commentaryTypes.length)];
    
    this.sayCommentary(randomType);
    this.lastCommentaryTime = now;
  }

  /**
   * Say specific commentary
   */
  sayCommentary(type, data = {}) {
    if (!this.isActive) return;
    
    const templates = this.commentaryTemplates[type];
    if (!templates || templates.length === 0) return;
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Use current race data if no specific data provided
    const commentaryData = {
      ...this.currentRaceData,
      ...data
    };
    
    const commentary = this.formatCommentary(template, commentaryData);
    
    this.displayCommentary(commentary);
  }

  /**
   * Format commentary with data
   */
  formatCommentary(template, data) {
    let commentary = template;
    
    // Replace placeholders with proper values
    if (data.driver) {
      commentary = commentary.replace(/\{driver\}/g, data.driver);
    }
    if (data.lap !== undefined) {
      commentary = commentary.replace(/\{lap\}/g, data.lap);
    }
    if (data.totalLaps !== undefined) {
      commentary = commentary.replace(/\{totalLaps\}/g, data.totalLaps);
    }
    if (data.remaining !== undefined) {
      commentary = commentary.replace(/\{remaining\}/g, data.remaining);
    }
    if (data.weather) {
      commentary = commentary.replace(/\{weather\}/g, data.weather);
    }
    
    return commentary;
  }

  /**
   * Display commentary
   */
  displayCommentary(commentary) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n🎤 [${timestamp}] ${this.currentCommentator.name}: ${commentary}`);
  }

  /**
   * Handle race events
   */
  handleRaceEvent(eventType, data) {
    if (!this.isActive) return;
    
    const now = Date.now();
    
    // Check if we should comment on this event
    if (this.shouldCommentOnEvent(eventType, now)) {
      this.sayCommentary(eventType, data);
      this.lastEvents[eventType] = now;
    }
  }

  /**
   * Check if we should comment on an event
   */
  shouldCommentOnEvent(eventType, now) {
    const lastEvent = this.lastEvents[eventType];
    if (!lastEvent) return true;
    
    // Don't comment on the same event type too frequently
    const timeSinceLastEvent = now - lastEvent;
    const minInterval = {
      overtaking: 5000,    // 5 seconds
      incidents: 10000,    // 10 seconds
      pitStops: 8000,      // 8 seconds
      weather: 30000,      // 30 seconds
      safetyCar: 15000     // 15 seconds
    };
    
    return timeSinceLastEvent > (minInterval[eventType] || 5000);
  }

  /**
   * Update race data for commentary
   */
  updateRaceData(raceData) {
    if (!this.isActive) return;
    
    // Store current race data
    this.currentRaceData = raceData;
    
    // Comment on lap milestones
    if (raceData.lap > 0 && raceData.lap % 10 === 0) {
      this.sayCommentary('lapProgress', {
        lap: raceData.lap,
        totalLaps: raceData.totalLaps,
        remaining: raceData.totalLaps - raceData.lap
      });
    }
    
    // Comment on weather changes
    if (raceData.weather && raceData.weather !== this.lastWeather) {
      this.handleRaceEvent('weather', { weather: raceData.weather });
      this.lastWeather = raceData.weather;
    }
    
    // Comment on safety car
    if (raceData.safetyCar && !this.lastSafetyCar) {
      this.handleRaceEvent('safetyCar', {});
      this.lastSafetyCar = true;
    } else if (!raceData.safetyCar && this.lastSafetyCar) {
      this.lastSafetyCar = false;
    }
  }

  /**
   * Handle driver events
   */
  handleDriverEvent(eventType, driverData) {
    if (!this.isActive) return;
    
    this.handleRaceEvent(eventType, {
      driver: driverData.name,
      team: driverData.team
    });
  }

  /**
   * Get commentary status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      currentCommentator: this.currentCommentator.name,
      lastCommentaryTime: this.lastCommentaryTime
    };
  }
}

// Export for use with the main simulator
export { F1CommentarySystem };

// Standalone usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const commentary = new F1CommentarySystem();
  
  console.log('🎤 F1 Commentary System Demo');
  console.log('Press Ctrl+C to stop');
  
  commentary.start();
  
  // Demo events
  setTimeout(() => {
    commentary.handleDriverEvent('overtaking', { name: 'Max VERSTAPPEN', team: 'Red Bull Racing' });
  }, 5000);
  
  setTimeout(() => {
    commentary.handleDriverEvent('incidents', { name: 'Lewis HAMILTON', team: 'Mercedes' });
  }, 10000);
  
  setTimeout(() => {
    commentary.handleDriverEvent('pitStops', { name: 'Charles LECLERC', team: 'Ferrari' });
  }, 15000);
  
  setTimeout(() => {
    commentary.updateRaceData({ lap: 20, totalLaps: 78, weather: 'rain' });
  }, 20000);
  
  // Demo lap progress commentary
  setTimeout(() => {
    commentary.sayCommentary('lapProgress', { lap: 15, totalLaps: 78, remaining: 63 });
  }, 25000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🎤 Stopping commentary demo...');
    commentary.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🎤 Stopping commentary demo...');
    commentary.stop();
    process.exit(0);
  });
}
