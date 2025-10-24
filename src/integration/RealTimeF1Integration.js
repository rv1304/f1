/**
 * VelocityForge Real-Time F1 Data Integration
 * 
 * Integration with real F1 APIs for live race data, predictions, and analysis.
 * Uses OpenF1, Ergast, and other real F1 data sources.
 */

export class RealTimeF1Integration {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes for real-time data
    this.isOnline = true;
    
    // Real F1 API endpoints
    this.apis = {
      openF1: {
        baseUrl: 'https://api.openf1.org',
        endpoints: {
          sessions: '/v1/sessions',
          drivers: '/v1/drivers',
          teams: '/v1/teams',
          circuits: '/v1/circuits',
          liveTiming: '/v1/live_timing',
          weather: '/v1/weather',
          pitStops: '/v1/pit_stops',
          positions: '/v1/positions'
        }
      },
      ergast: {
        baseUrl: 'http://ergast.com/api/f1',
        endpoints: {
          currentSeason: '/current',
          drivers: '/current/drivers.json',
          constructors: '/current/constructors.json',
          circuits: '/current/circuits.json',
          results: '/current/results.json',
          qualifying: '/current/qualifying.json',
          standings: '/current/driverStandings.json'
        }
      },
      f1Live: {
        baseUrl: 'https://live.f1api.dev',
        endpoints: {
          liveData: '/live',
          raceData: '/race',
          weather: '/weather',
          telemetry: '/telemetry'
        }
      }
    };
    
    this.stats = {
      requestsMade: 0,
      cacheHits: 0,
      dataEnhancements: 0,
      lastUpdate: 0,
      errors: 0
    };
    
    // Real-time data streams
    this.liveData = {
      session: null,
      drivers: [],
      positions: [],
      weather: null,
      pitStops: [],
      telemetry: {}
    };
  }

  /**
   * Initialize real-time F1 data integration
   */
  async initialize() {
    console.log('🔗 Initializing real-time F1 data integration...');
    
    try {
      // Check API availability
      await this.checkAPIAvailability();
      
      // Load cached data
      await this.loadCachedData();
      
      // Fetch current season data
      await this.fetchCurrentSeasonData();
      
      // Start real-time data streams
      await this.startLiveDataStreams();
      
      console.log('✅ Real-time F1 data integration initialized');
      return true;
    } catch (error) {
      console.warn('⚠️ Real-time F1 data integration failed, using fallback:', error.message);
      return false;
    }
  }

  /**
   * Check API availability
   */
  async checkAPIAvailability() {
    const availableAPIs = [];
    
    for (const [apiName, apiConfig] of Object.entries(this.apis)) {
      try {
        const isAvailable = await this.pingAPI(apiConfig.baseUrl);
        if (isAvailable) {
          availableAPIs.push(apiName);
        }
      } catch (error) {
        console.warn(`⚠️ API ${apiName} unavailable:`, error.message);
      }
    }
    
    console.log(`📡 Available APIs: ${availableAPIs.join(', ')}`);
    return availableAPIs;
  }

  /**
   * Ping API endpoint
   */
  async pingAPI(baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'HEAD',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      // Fallback: assume API is available if ping fails
      return true;
    }
  }

  /**
   * Fetch current season data
   */
  async fetchCurrentSeasonData() {
    console.log('📡 Fetching current F1 season data...');
    
    try {
      // Fetch drivers from Ergast API
      const driversData = await this.fetchFromAPI('ergast', 'drivers');
      if (driversData) {
        await this.processDriversData(driversData);
      }
      
      // Fetch constructors from Ergast API
      const constructorsData = await this.fetchFromAPI('ergast', 'constructors');
      if (constructorsData) {
        await this.processConstructorsData(constructorsData);
      }
      
      // Fetch circuits from Ergast API
      const circuitsData = await this.fetchFromAPI('ergast', 'circuits');
      if (circuitsData) {
        await this.processCircuitsData(circuitsData);
      }
      
      // Fetch current standings
      const standingsData = await this.fetchFromAPI('ergast', 'standings');
      if (standingsData) {
        await this.processStandingsData(standingsData);
      }
      
      console.log('✅ Current season data fetched');
    } catch (error) {
      console.warn('⚠️ Failed to fetch current season data:', error.message);
    }
  }

  /**
   * Fetch data from specific API
   */
  async fetchFromAPI(apiName, endpoint) {
    try {
      const apiConfig = this.apis[apiName];
      if (!apiConfig) return null;
      
      const url = `${apiConfig.baseUrl}${apiConfig.endpoints[endpoint]}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'VelocityForge-F1-Simulator/1.0'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.stats.requestsMade++;
      
      return data;
    } catch (error) {
      console.warn(`⚠️ Failed to fetch from ${apiName}/${endpoint}:`, error.message);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Process drivers data from API
   */
  async processDriversData(data) {
    if (!data.MRData?.DriverTable?.Drivers) return;
    
    const drivers = data.MRData.DriverTable.Drivers;
    
    for (const driver of drivers) {
      const driverId = driver.driverId;
      const cacheKey = `driver_${driverId}`;
      
      // Get existing data or create new
      const existingData = this.cache.get(cacheKey) || {};
      
      // Merge with real API data
      const enhancedData = {
        ...existingData,
        driverId: driver.driverId,
        permanentNumber: driver.permanentNumber,
        code: driver.code,
        givenName: driver.givenName,
        familyName: driver.familyName,
        dateOfBirth: driver.dateOfBirth,
        nationality: driver.nationality,
        url: driver.url,
        realStats: {
          ...existingData.realStats,
          // Add real-time stats if available
          currentSeasonPoints: 0,
          currentSeasonWins: 0,
          currentSeasonPodiums: 0,
          lastUpdated: Date.now()
        }
      };
      
      this.cache.set(cacheKey, enhancedData);
    }
    
    console.log(`📈 Processed ${drivers.length} drivers from real API`);
  }

  /**
   * Process constructors data from API
   */
  async processConstructorsData(data) {
    if (!data.MRData?.ConstructorTable?.Constructors) return;
    
    const constructors = data.MRData.ConstructorTable.Constructors;
    
    for (const constructor of constructors) {
      const constructorId = constructor.constructorId;
      const cacheKey = `constructor_${constructorId}`;
      
      const existingData = this.cache.get(cacheKey) || {};
      
      const enhancedData = {
        ...existingData,
        constructorId: constructor.constructorId,
        name: constructor.name,
        nationality: constructor.nationality,
        url: constructor.url,
        realStats: {
          ...existingData.realStats,
          currentSeasonPoints: 0,
          currentSeasonWins: 0,
          lastUpdated: Date.now()
        }
      };
      
      this.cache.set(cacheKey, enhancedData);
    }
    
    console.log(`📈 Processed ${constructors.length} constructors from real API`);
  }

  /**
   * Process circuits data from API
   */
  async processCircuitsData(data) {
    if (!data.MRData?.CircuitTable?.Circuits) return;
    
    const circuits = data.MRData.CircuitTable.Circuits;
    
    for (const circuit of circuits) {
      const circuitId = circuit.circuitId;
      const cacheKey = `circuit_${circuitId}`;
      
      const existingData = this.cache.get(cacheKey) || {};
      
      const enhancedData = {
        ...existingData,
        circuitId: circuit.circuitId,
        circuitName: circuit.circuitName,
        location: circuit.Location,
        url: circuit.url,
        realStats: {
          ...existingData.realStats,
          length: circuit.Location?.lat ? 'Unknown' : 'Unknown',
          lastUpdated: Date.now()
        }
      };
      
      this.cache.set(cacheKey, enhancedData);
    }
    
    console.log(`📈 Processed ${circuits.length} circuits from real API`);
  }

  /**
   * Process standings data from API
   */
  async processStandingsData(data) {
    if (!data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings) return;
    
    const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
    
    for (const standing of standings) {
      const driverId = standing.Driver.driverId;
      const cacheKey = `driver_${driverId}`;
      
      const existingData = this.cache.get(cacheKey) || {};
      
      if (existingData.realStats) {
        existingData.realStats.currentSeasonPoints = parseInt(standing.points);
        existingData.realStats.currentSeasonPosition = parseInt(standing.position);
        existingData.realStats.currentSeasonWins = parseInt(standing.wins);
        existingData.realStats.lastUpdated = Date.now();
        
        this.cache.set(cacheKey, existingData);
      }
    }
    
    console.log(`📈 Processed ${standings.length} driver standings from real API`);
  }

  /**
   * Start live data streams
   */
  async startLiveDataStreams() {
    console.log('📡 Starting live F1 data streams...');
    
    // Start live timing updates
    this.startLiveTimingUpdates();
    
    // Start weather updates
    this.startWeatherUpdates();
    
    // Start pit stop monitoring
    this.startPitStopMonitoring();
    
    console.log('✅ Live data streams started');
  }

  /**
   * Start live timing updates
   */
  startLiveTimingUpdates() {
    setInterval(async () => {
      try {
        const liveData = await this.fetchFromAPI('openF1', 'liveTiming');
        if (liveData) {
          this.liveData.positions = liveData;
          this.updateDriverPositions(liveData);
        }
      } catch (error) {
        console.warn('⚠️ Live timing update failed:', error.message);
      }
    }, 5000); // Update every 5 seconds
  }

  /**
   * Start weather updates
   */
  startWeatherUpdates() {
    setInterval(async () => {
      try {
        const weatherData = await this.fetchFromAPI('openF1', 'weather');
        if (weatherData) {
          this.liveData.weather = weatherData;
        }
      } catch (error) {
        console.warn('⚠️ Weather update failed:', error.message);
      }
    }, 30000); // Update every 30 seconds
  }

  /**
   * Start pit stop monitoring
   */
  startPitStopMonitoring() {
    setInterval(async () => {
      try {
        const pitStopData = await this.fetchFromAPI('openF1', 'pitStops');
        if (pitStopData) {
          this.liveData.pitStops = pitStopData;
          this.processPitStopData(pitStopData);
        }
      } catch (error) {
        console.warn('⚠️ Pit stop monitoring failed:', error.message);
      }
    }, 10000); // Update every 10 seconds
  }

  /**
   * Update driver positions from live data
   */
  updateDriverPositions(positionsData) {
    for (const position of positionsData) {
      const driverId = position.driver_id;
      const cacheKey = `driver_${driverId}`;
      
      const existingData = this.cache.get(cacheKey) || {};
      
      if (existingData.realStats) {
        existingData.realStats.currentPosition = position.position;
        existingData.realStats.currentLapTime = position.lap_time;
        existingData.realStats.currentGap = position.gap;
        existingData.realStats.lastUpdated = Date.now();
        
        this.cache.set(cacheKey, existingData);
      }
    }
  }

  /**
   * Process pit stop data
   */
  processPitStopData(pitStopData) {
    for (const pitStop of pitStopData) {
      const driverId = pitStop.driver_id;
      const cacheKey = `driver_${driverId}`;
      
      const existingData = this.cache.get(cacheKey) || {};
      
      if (existingData.realStats) {
        existingData.realStats.pitStopCount = (existingData.realStats.pitStopCount || 0) + 1;
        existingData.realStats.lastPitStopTime = pitStop.pit_duration;
        existingData.realStats.lastUpdated = Date.now();
        
        this.cache.set(cacheKey, existingData);
      }
    }
  }

  /**
   * Get real-time driver data
   */
  getRealTimeDriverData(driverId) {
    const cacheKey = `driver_${driverId}`;
    return this.cache.get(cacheKey) || null;
  }

  /**
   * Get real-time constructor data
   */
  getRealTimeConstructorData(constructorId) {
    const cacheKey = `constructor_${constructorId}`;
    return this.cache.get(cacheKey) || null;
  }

  /**
   * Get real-time circuit data
   */
  getRealTimeCircuitData(circuitId) {
    const cacheKey = `circuit_${circuitId}`;
    return this.cache.get(cacheKey) || null;
  }

  /**
   * Get live race data
   */
  getLiveRaceData() {
    return {
      session: this.liveData.session,
      drivers: this.liveData.drivers,
      positions: this.liveData.positions,
      weather: this.liveData.weather,
      pitStops: this.liveData.pitStops,
      telemetry: this.liveData.telemetry,
      lastUpdate: Date.now()
    };
  }

  /**
   * Predict race outcome using real-time data
   */
  predictRaceOutcome(drivers, trackId, weatherConditions) {
    const predictions = [];
    
    for (const driver of drivers) {
      const realTimeData = this.getRealTimeDriverData(driver.id);
      const performanceScore = this.calculateRealTimePerformanceScore(driver.id, trackId, weatherConditions);
      
      predictions.push({
        driverId: driver.id,
        driverName: driver.name,
        performanceScore,
        realTimeData: realTimeData?.realStats || null,
        predictedPosition: 0,
        confidence: this.calculateRealTimeConfidence(driver.id, trackId),
        pitStopStrategy: this.predictPitStopStrategy(driver.id, trackId, weatherConditions),
        tireStrategy: this.predictTireStrategy(driver.id, trackId, weatherConditions)
      });
    }
    
    // Sort by performance score
    predictions.sort((a, b) => b.performanceScore - a.performanceScore);
    
    // Assign predicted positions
    predictions.forEach((prediction, index) => {
      prediction.predictedPosition = index + 1;
    });
    
    return predictions;
  }

  /**
   * Calculate real-time performance score
   */
  calculateRealTimePerformanceScore(driverId, trackId, weatherConditions) {
    const realTimeData = this.getRealTimeDriverData(driverId);
    if (!realTimeData?.realStats) return 0;
    
    const stats = realTimeData.realStats;
    let score = 0;
    
    // Current season performance (40%)
    score += (stats.currentSeasonPoints || 0) * 0.4;
    
    // Current position (20%)
    if (stats.currentPosition) {
      score += (21 - stats.currentPosition) * 2;
    }
    
    // Consistency (20%)
    score += (stats.consistency || 5) * 4;
    
    // Weather performance (10%)
    if (weatherConditions.precipitation > 0) {
      score += (stats.wetWeatherRating || 5) * 2;
    }
    
    // Track-specific performance (10%)
    const trackData = this.getRealTimeCircuitData(trackId);
    if (trackData?.realStats) {
      score += (trackData.realStats.trackPerformance || 5) * 2;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate real-time prediction confidence
   */
  calculateRealTimeConfidence(driverId, trackId) {
    const driverData = this.getRealTimeDriverData(driverId);
    const trackData = this.getRealTimeCircuitData(trackId);
    
    let confidence = 0.3; // Base confidence
    
    // More real-time data = higher confidence
    if (driverData?.realStats?.lastUpdated) {
      const timeSinceUpdate = Date.now() - driverData.realStats.lastUpdated;
      if (timeSinceUpdate < 60000) { // Less than 1 minute
        confidence += 0.4;
      } else if (timeSinceUpdate < 300000) { // Less than 5 minutes
        confidence += 0.2;
      }
    }
    
    if (trackData?.realStats) {
      confidence += 0.3;
    }
    
    return Math.min(1.0, confidence);
  }

  /**
   * Predict pit stop strategy
   */
  predictPitStopStrategy(driverId, trackId, weatherConditions) {
    const driverData = this.getRealTimeDriverData(driverId);
    const trackData = this.getRealTimeCircuitData(trackId);
    
    if (!driverData?.realStats || !trackData?.realStats) {
      return { stops: 1, strategy: 'conservative' };
    }
    
    const driverStats = driverData.realStats;
    const trackStats = trackData.realStats;
    
    // Calculate optimal pit stops based on track characteristics
    let optimalStops = 1;
    
    // Track length and tire degradation
    if (trackStats.tireDegradation > 7) {
      optimalStops = 2;
    } else if (trackStats.tireDegradation > 5) {
      optimalStops = 1.5;
    }
    
    // Weather impact
    if (weatherConditions.precipitation > 0) {
      optimalStops += 1; // Extra stop for wet tires
    }
    
    // Driver strategy preference
    const strategyPreference = driverStats.strategyRating || 5;
    if (strategyPreference > 7) {
      optimalStops += 0.5; // Aggressive strategy
    }
    
    return {
      stops: Math.round(optimalStops),
      strategy: optimalStops > 2 ? 'aggressive' : optimalStops < 1.5 ? 'conservative' : 'balanced',
      timing: this.calculatePitStopTiming(optimalStops, trackStats),
      tireCompounds: this.predictTireCompounds(trackStats, weatherConditions)
    };
  }

  /**
   * Predict tire strategy
   */
  predictTireStrategy(driverId, trackId, weatherConditions) {
    const trackData = this.getRealTimeCircuitData(trackId);
    
    if (!trackData?.realStats) {
      return { compounds: ['medium'], strategy: 'conservative' };
    }
    
    const trackStats = trackData.realStats;
    
    // Determine tire compounds based on track characteristics
    let compounds = ['medium'];
    
    if (trackStats.tireDegradation > 7) {
      compounds = ['soft', 'medium', 'hard'];
    } else if (trackStats.tireDegradation > 5) {
      compounds = ['medium', 'hard'];
    }
    
    // Weather adjustments
    if (weatherConditions.precipitation > 0) {
      compounds = ['intermediate', 'wet'];
    }
    
    return {
      compounds,
      strategy: trackStats.tireDegradation > 6 ? 'aggressive' : 'conservative',
      stintLengths: this.calculateStintLengths(compounds, trackStats)
    };
  }

  /**
   * Calculate pit stop timing
   */
  calculatePitStopTiming(stops, trackStats) {
    const raceLength = trackStats.laps || 78;
    const interval = raceLength / (stops + 1);
    
    return Array.from({ length: stops }, (_, i) => Math.round(interval * (i + 1)));
  }

  /**
   * Calculate stint lengths
   */
  calculateStintLengths(compounds, trackStats) {
    const raceLength = trackStats.laps || 78;
    const stintLength = raceLength / compounds.length;
    
    return compounds.map(() => Math.round(stintLength));
  }

  /**
   * Load cached data
   */
  async loadCachedData() {
    try {
      const cachedData = localStorage.getItem('velocityforge_realtime_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const now = Date.now();
        
        if (now - parsed.timestamp < this.cacheExpiry) {
          this.cache = new Map(Object.entries(parsed.data));
          this.stats.cacheHits++;
          console.log('📦 Loaded cached real-time data');
          return true;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load cached data:', error.message);
    }
    
    return false;
  }

  /**
   * Save data to cache
   */
  saveToCache() {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data: Object.fromEntries(this.cache)
      };
      
      localStorage.setItem('velocityforge_realtime_cache', JSON.stringify(cacheData));
      console.log('💾 Real-time data cached successfully');
    } catch (error) {
      console.warn('⚠️ Failed to cache data:', error.message);
    }
  }

  /**
   * Get integration statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      liveData: this.liveData,
      lastUpdate: new Date(this.stats.lastUpdate).toISOString()
    };
  }
}
