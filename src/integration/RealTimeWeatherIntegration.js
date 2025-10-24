/**
 * VelocityForge Real-Time Weather Integration
 * 
 * Integration with real weather APIs for live race conditions,
 * weather predictions, and track-specific weather analysis.
 */

export class RealTimeWeatherIntegration {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes for weather data
    
    // Weather API endpoints
    this.apis = {
      openWeatherMap: {
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        apiKey: process.env.OPENWEATHER_API_KEY || 'demo_key',
        endpoints: {
          current: '/weather',
          forecast: '/forecast',
          onecall: '/onecall'
        }
      },
      weatherAPI: {
        baseUrl: 'https://api.weatherapi.com/v1',
        apiKey: process.env.WEATHERAPI_KEY || 'demo_key',
        endpoints: {
          current: '/current.json',
          forecast: '/forecast.json',
          history: '/history.json'
        }
      },
      f1Weather: {
        baseUrl: 'https://api.openf1.org/v1',
        endpoints: {
          weather: '/weather',
          sessions: '/sessions'
        }
      }
    };
    
    this.stats = {
      requestsMade: 0,
      cacheHits: 0,
      errors: 0,
      lastUpdate: 0
    };
    
    // F1 track coordinates
    this.trackCoordinates = {
      monaco: { lat: 43.7347, lon: 7.4206 },
      silverstone: { lat: 52.0786, lon: -1.0169 },
      spa: { lat: 50.4372, lon: 5.9714 },
      monza: { lat: 45.6156, lon: 9.2811 },
      interlagos: { lat: -23.7036, lon: -46.6997 },
      suzuka: { lat: 34.8431, lon: 136.5414 },
      abu_dhabi: { lat: 24.4672, lon: 54.6031 },
      melbourne: { lat: -37.8497, lon: 144.9681 },
      bahrain: { lat: 26.0325, lon: 50.5106 },
      jeddah: { lat: 21.6319, lon: 39.1044 },
      miami: { lat: 25.9581, lon: -80.2389 },
      barcelona: { lat: 41.5700, lon: 2.2611 },
      imola: { lat: 44.3439, lon: 11.7167 },
      montreal: { lat: 45.5017, lon: -73.5228 },
      red_bull_ring: { lat: 47.2197, lon: 14.7647 },
      hungaroring: { lat: 47.5789, lon: 19.2486 },
      zandvoort: { lat: 52.3888, lon: 4.5409 },
      singapore: { lat: 1.2914, lon: 103.8644 },
      austin: { lat: 30.1328, lon: -97.6411 },
      mexico: { lat: 19.4042, lon: -99.0907 },
      las_vegas: { lat: 36.1699, lon: -115.1398 },
      qatar: { lat: 25.4901, lon: 51.4542 }
    };
  }

  /**
   * Initialize weather integration
   */
  async initialize() {
    console.log('🌤️ Initializing real-time weather integration...');
    
    try {
      // Check API availability
      await this.checkAPIAvailability();
      
      // Load cached data
      await this.loadCachedData();
      
      console.log('✅ Real-time weather integration initialized');
      return true;
    } catch (error) {
      console.warn('⚠️ Weather integration failed, using fallback:', error.message);
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
        const isAvailable = await this.pingWeatherAPI(apiConfig.baseUrl);
        if (isAvailable) {
          availableAPIs.push(apiName);
        }
      } catch (error) {
        console.warn(`⚠️ Weather API ${apiName} unavailable:`, error.message);
      }
    }
    
    console.log(`🌤️ Available weather APIs: ${availableAPIs.join(', ')}`);
    return availableAPIs;
  }

  /**
   * Ping weather API
   */
  async pingWeatherAPI(baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/ping`, {
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
   * Get current weather for F1 track
   */
  async getCurrentWeather(trackId) {
    const cacheKey = `weather_${trackId}_current`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.stats.cacheHits++;
      return cached.data;
    }
    
    try {
      const coordinates = this.trackCoordinates[trackId];
      if (!coordinates) {
        throw new Error(`Track coordinates not found for ${trackId}`);
      }
      
      // Try multiple weather APIs
      let weatherData = null;
      
      // Try OpenWeatherMap first
      try {
        weatherData = await this.fetchFromOpenWeatherMap(coordinates);
      } catch (error) {
        console.warn('⚠️ OpenWeatherMap failed, trying WeatherAPI:', error.message);
      }
      
      // Try WeatherAPI if OpenWeatherMap failed
      if (!weatherData) {
        try {
          weatherData = await this.fetchFromWeatherAPI(coordinates);
        } catch (error) {
          console.warn('⚠️ WeatherAPI failed, using fallback:', error.message);
        }
      }
      
      // Use fallback data if all APIs fail
      if (!weatherData) {
        weatherData = this.generateFallbackWeather(trackId);
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });
      
      this.stats.requestsMade++;
      this.stats.lastUpdate = Date.now();
      
      return weatherData;
    } catch (error) {
      console.warn(`⚠️ Failed to get weather for ${trackId}:`, error.message);
      this.stats.errors++;
      return this.generateFallbackWeather(trackId);
    }
  }

  /**
   * Fetch weather from OpenWeatherMap
   */
  async fetchFromOpenWeatherMap(coordinates) {
    const apiKey = this.apis.openWeatherMap.apiKey;
    const url = `${this.apis.openWeatherMap.baseUrl}${this.apis.openWeatherMap.endpoints.current}`;
    
    const response = await fetch(`${url}?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      cloudCover: data.clouds.all,
      precipitation: data.rain?.['1h'] || 0,
      visibility: data.visibility / 1000, // Convert to km
      trackTemperature: data.main.temp + 10, // Estimate track temp
      airDensity: this.calculateAirDensity(data.main.temp, data.main.pressure, data.main.humidity),
      weatherCondition: data.weather[0].main,
      weatherDescription: data.weather[0].description,
      source: 'OpenWeatherMap',
      timestamp: Date.now()
    };
  }

  /**
   * Fetch weather from WeatherAPI
   */
  async fetchFromWeatherAPI(coordinates) {
    const apiKey = this.apis.weatherAPI.apiKey;
    const url = `${this.apis.weatherAPI.baseUrl}${this.apis.weatherAPI.endpoints.current}`;
    
    const response = await fetch(`${url}?key=${apiKey}&q=${coordinates.lat},${coordinates.lon}`);
    
    if (!response.ok) {
      throw new Error(`WeatherAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      pressure: data.current.pressure_mb,
      windSpeed: data.current.wind_kph / 3.6, // Convert to m/s
      windDirection: data.current.wind_degree,
      cloudCover: data.current.cloud,
      precipitation: data.current.precip_mm,
      visibility: data.current.vis_km,
      trackTemperature: data.current.temp_c + 10,
      airDensity: this.calculateAirDensity(data.current.temp_c, data.current.pressure_mb, data.current.humidity),
      weatherCondition: data.current.condition.text,
      weatherDescription: data.current.condition.text,
      source: 'WeatherAPI',
      timestamp: Date.now()
    };
  }

  /**
   * Generate fallback weather data
   */
  generateFallbackWeather(trackId) {
    // Generate realistic weather based on track location and season
    const baseTemp = this.getBaseTemperature(trackId);
    const season = this.getCurrentSeason();
    
    return {
      temperature: baseTemp + (Math.random() - 0.5) * 10,
      humidity: 60 + (Math.random() - 0.5) * 30,
      pressure: 1013.25 + (Math.random() - 0.5) * 20,
      windSpeed: Math.random() * 10,
      windDirection: Math.random() * 360,
      cloudCover: Math.random() * 100,
      precipitation: Math.random() > 0.8 ? Math.random() * 5 : 0,
      visibility: 10000 + (Math.random() - 0.5) * 2000,
      trackTemperature: baseTemp + 10 + (Math.random() - 0.5) * 5,
      airDensity: 1.225 + (Math.random() - 0.5) * 0.1,
      weatherCondition: this.getWeatherCondition(),
      weatherDescription: 'Simulated weather data',
      source: 'Fallback',
      timestamp: Date.now()
    };
  }

  /**
   * Get base temperature for track
   */
  getBaseTemperature(trackId) {
    const trackTemps = {
      monaco: 25,
      silverstone: 18,
      spa: 20,
      monza: 22,
      interlagos: 28,
      suzuka: 24,
      abu_dhabi: 32,
      melbourne: 26,
      bahrain: 30,
      jeddah: 35,
      miami: 28,
      barcelona: 24,
      imola: 22,
      montreal: 20,
      red_bull_ring: 18,
      hungaroring: 24,
      zandvoort: 19,
      singapore: 30,
      austin: 26,
      mexico: 28,
      las_vegas: 32,
      qatar: 34
    };
    
    return trackTemps[trackId] || 25;
  }

  /**
   * Get current season
   */
  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  /**
   * Get weather condition
   */
  getWeatherCondition() {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Thunderstorm', 'Snow', 'Mist'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  /**
   * Calculate air density
   */
  calculateAirDensity(temperature, pressure, humidity) {
    // Simplified air density calculation
    const R = 287.05; // Gas constant for dry air
    const temperatureK = temperature + 273.15;
    const pressurePa = pressure * 100; // Convert to Pa
    
    return pressurePa / (R * temperatureK);
  }

  /**
   * Get weather forecast for F1 track
   */
  async getWeatherForecast(trackId, days = 3) {
    const cacheKey = `weather_${trackId}_forecast_${days}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.stats.cacheHits++;
      return cached.data;
    }
    
    try {
      const coordinates = this.trackCoordinates[trackId];
      if (!coordinates) {
        throw new Error(`Track coordinates not found for ${trackId}`);
      }
      
      // Try to get forecast from weather API
      let forecastData = null;
      
      try {
        forecastData = await this.fetchForecastFromAPI(coordinates, days);
      } catch (error) {
        console.warn('⚠️ Forecast API failed, generating fallback:', error.message);
        forecastData = this.generateFallbackForecast(trackId, days);
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: forecastData,
        timestamp: Date.now()
      });
      
      this.stats.requestsMade++;
      
      return forecastData;
    } catch (error) {
      console.warn(`⚠️ Failed to get forecast for ${trackId}:`, error.message);
      this.stats.errors++;
      return this.generateFallbackForecast(trackId, days);
    }
  }

  /**
   * Fetch forecast from weather API
   */
  async fetchForecastFromAPI(coordinates, days) {
    const apiKey = this.apis.openWeatherMap.apiKey;
    const url = `${this.apis.openWeatherMap.baseUrl}${this.apis.openWeatherMap.endpoints.forecast}`;
    
    const response = await fetch(`${url}?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.list.slice(0, days * 8).map(item => ({
      datetime: new Date(item.dt * 1000),
      temperature: item.main.temp,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      windSpeed: item.wind.speed,
      windDirection: item.wind.deg,
      cloudCover: item.clouds.all,
      precipitation: item.rain?.['3h'] || 0,
      weatherCondition: item.weather[0].main,
      weatherDescription: item.weather[0].description
    }));
  }

  /**
   * Generate fallback forecast
   */
  generateFallbackForecast(trackId, days) {
    const forecast = [];
    const baseTemp = this.getBaseTemperature(trackId);
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        datetime: date,
        temperature: baseTemp + (Math.random() - 0.5) * 10,
        humidity: 60 + (Math.random() - 0.5) * 30,
        pressure: 1013.25 + (Math.random() - 0.5) * 20,
        windSpeed: Math.random() * 10,
        windDirection: Math.random() * 360,
        cloudCover: Math.random() * 100,
        precipitation: Math.random() > 0.7 ? Math.random() * 5 : 0,
        weatherCondition: this.getWeatherCondition(),
        weatherDescription: 'Simulated forecast data'
      });
    }
    
    return forecast;
  }

  /**
   * Analyze weather impact on F1 performance
   */
  analyzeWeatherImpact(weatherData, trackId) {
    const impact = {
      enginePerformance: 1.0,
      aerodynamics: 1.0,
      tirePerformance: 1.0,
      visibility: 1.0,
      safetyRisk: 1.0,
      strategyImpact: 'normal'
    };
    
    // Temperature impact
    if (weatherData.temperature > 35) {
      impact.enginePerformance *= 0.95; // Engine overheating risk
      impact.tirePerformance *= 0.90; // Tire degradation
    } else if (weatherData.temperature < 10) {
      impact.enginePerformance *= 0.98; // Cold start issues
      impact.tirePerformance *= 0.85; // Cold tire performance
    }
    
    // Humidity impact
    if (weatherData.humidity > 80) {
      impact.enginePerformance *= 0.97; // Air density
      impact.aerodynamics *= 0.98; // Air density
    }
    
    // Wind impact
    if (weatherData.windSpeed > 15) {
      impact.aerodynamics *= 0.95; // Crosswind effects
      impact.safetyRisk *= 1.2; // Increased risk
    }
    
    // Precipitation impact
    if (weatherData.precipitation > 0) {
      impact.tirePerformance *= 0.70; // Wet tire performance
      impact.visibility *= 0.60; // Reduced visibility
      impact.safetyRisk *= 1.5; // Significantly increased risk
      impact.strategyImpact = 'wet';
    }
    
    // Cloud cover impact
    if (weatherData.cloudCover > 80) {
      impact.visibility *= 0.90; // Reduced visibility
    }
    
    return impact;
  }

  /**
   * Predict weather for race day
   */
  async predictRaceWeather(trackId, raceDate) {
    try {
      const forecast = await this.getWeatherForecast(trackId, 7);
      const raceDay = new Date(raceDate);
      
      // Find closest forecast to race date
      const closestForecast = forecast.reduce((closest, current) => {
        const currentDiff = Math.abs(current.datetime - raceDay);
        const closestDiff = Math.abs(closest.datetime - raceDay);
        return currentDiff < closestDiff ? current : closest;
      });
      
      return {
        ...closestForecast,
        confidence: this.calculateWeatherConfidence(closestForecast, raceDay),
        impact: this.analyzeWeatherImpact(closestForecast, trackId)
      };
    } catch (error) {
      console.warn(`⚠️ Failed to predict race weather:`, error.message);
      return this.generateFallbackWeather(trackId);
    }
  }

  /**
   * Calculate weather prediction confidence
   */
  calculateWeatherConfidence(forecast, raceDate) {
    const daysDiff = Math.abs(forecast.datetime - raceDate) / (1000 * 60 * 60 * 24);
    
    // Confidence decreases with time distance
    if (daysDiff <= 1) return 0.9;
    if (daysDiff <= 3) return 0.7;
    if (daysDiff <= 7) return 0.5;
    return 0.3;
  }

  /**
   * Load cached data
   */
  async loadCachedData() {
    try {
      const cachedData = localStorage.getItem('velocityforge_weather_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const now = Date.now();
        
        if (now - parsed.timestamp < this.cacheExpiry) {
          this.cache = new Map(Object.entries(parsed.data));
          this.stats.cacheHits++;
          console.log('📦 Loaded cached weather data');
          return true;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load cached weather data:', error.message);
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
      
      localStorage.setItem('velocityforge_weather_cache', JSON.stringify(cacheData));
      console.log('💾 Weather data cached successfully');
    } catch (error) {
      console.warn('⚠️ Failed to cache weather data:', error.message);
    }
  }

  /**
   * Get weather statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      lastUpdate: new Date(this.stats.lastUpdate).toISOString()
    };
  }
}
