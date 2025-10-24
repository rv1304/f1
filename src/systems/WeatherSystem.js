/**
 * VelocityForge F1 Weather System
 * 
 * Dynamic weather simulation with realistic effects on F1 performance,
 * tire behavior, and race strategy.
 */

export class WeatherSystem {
  constructor() {
    this.currentWeather = {
      temperature: 25, // °C
      humidity: 60, // %
      pressure: 1013.25, // hPa
      windSpeed: 5, // km/h
      windDirection: 180, // degrees
      cloudCover: 30, // %
      precipitation: 0, // mm/h
      visibility: 10000, // meters
      trackTemperature: 35, // °C
      airDensity: 1.225 // kg/m³
    };
    
    this.weatherForecast = [];
    this.weatherHistory = [];
    this.isDynamic = true;
    this.updateInterval = null;
    this.updateFrequency = 1000; // Update every second
    
    // Weather patterns
    this.weatherPatterns = {
      'clear': {
        temperature: { min: 20, max: 30 },
        humidity: { min: 40, max: 70 },
        cloudCover: { min: 0, max: 20 },
        precipitation: 0,
        windSpeed: { min: 2, max: 8 }
      },
      'partly_cloudy': {
        temperature: { min: 18, max: 28 },
        humidity: { min: 50, max: 80 },
        cloudCover: { min: 20, max: 60 },
        precipitation: 0,
        windSpeed: { min: 3, max: 10 }
      },
      'overcast': {
        temperature: { min: 15, max: 25 },
        humidity: { min: 60, max: 90 },
        cloudCover: { min: 60, max: 100 },
        precipitation: 0,
        windSpeed: { min: 5, max: 15 }
      },
      'light_rain': {
        temperature: { min: 12, max: 22 },
        humidity: { min: 70, max: 95 },
        cloudCover: { min: 80, max: 100 },
        precipitation: { min: 0.5, max: 2.0 },
        windSpeed: { min: 8, max: 20 }
      },
      'heavy_rain': {
        temperature: { min: 10, max: 20 },
        humidity: { min: 80, max: 100 },
        cloudCover: { min: 90, max: 100 },
        precipitation: { min: 2.0, max: 10.0 },
        windSpeed: { min: 15, max: 30 }
      },
      'storm': {
        temperature: { min: 8, max: 18 },
        humidity: { min: 85, max: 100 },
        cloudCover: { min: 95, max: 100 },
        precipitation: { min: 5.0, max: 25.0 },
        windSpeed: { min: 25, max: 50 }
      }
    };
    
    this.currentPattern = 'clear';
    this.patternDuration = 0;
    this.maxPatternDuration = 3600; // 1 hour in seconds
  }

  /**
   * Start dynamic weather simulation
   */
  start() {
    if (this.isDynamic) return;
    
    this.isDynamic = true;
    this.updateInterval = setInterval(() => {
      this.updateWeather();
    }, this.updateFrequency);
    
    console.log('🌤️ Weather system started');
  }

  /**
   * Stop dynamic weather simulation
   */
  stop() {
    if (!this.isDynamic) return;
    
    this.isDynamic = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    console.log('🌤️ Weather system stopped');
  }

  /**
   * Update weather conditions
   */
  updateWeather() {
    // Check if pattern should change
    if (this.patternDuration >= this.maxPatternDuration) {
      this.changeWeatherPattern();
      this.patternDuration = 0;
    }
    
    // Update current weather based on pattern
    this.updateWeatherFromPattern();
    
    // Calculate derived values
    this.calculateDerivedValues();
    
    // Store in history
    this.weatherHistory.push({
      ...this.currentWeather,
      timestamp: performance.now()
    });
    
    // Keep only last 1000 entries
    if (this.weatherHistory.length > 1000) {
      this.weatherHistory.shift();
    }
    
    this.patternDuration += this.updateFrequency / 1000;
  }

  /**
   * Change weather pattern
   */
  changeWeatherPattern() {
    const patterns = Object.keys(this.weatherPatterns);
    const currentIndex = patterns.indexOf(this.currentPattern);
    
    // 70% chance to stay same, 30% chance to change
    if (Math.random() < 0.7) {
      return; // Stay same pattern
    }
    
    // Choose new pattern (avoid same pattern)
    let newPattern;
    do {
      newPattern = patterns[Math.floor(Math.random() * patterns.length)];
    } while (newPattern === this.currentPattern);
    
    this.currentPattern = newPattern;
    console.log(`🌤️ Weather pattern changed to: ${newPattern}`);
  }

  /**
   * Update weather from current pattern
   */
  updateWeatherFromPattern() {
    const pattern = this.weatherPatterns[this.currentPattern];
    
    // Update temperature
    this.currentWeather.temperature = this.randomInRange(pattern.temperature);
    
    // Update humidity
    this.currentWeather.humidity = this.randomInRange(pattern.humidity);
    
    // Update cloud cover
    this.currentWeather.cloudCover = this.randomInRange(pattern.cloudCover);
    
    // Update precipitation
    if (pattern.precipitation === 0) {
      this.currentWeather.precipitation = 0;
    } else {
      this.currentWeather.precipitation = this.randomInRange(pattern.precipitation);
    }
    
    // Update wind speed
    this.currentWeather.windSpeed = this.randomInRange(pattern.windSpeed);
    
    // Update wind direction (random)
    this.currentWeather.windDirection = Math.random() * 360;
  }

  /**
   * Calculate derived weather values
   */
  calculateDerivedValues() {
    // Calculate air density based on temperature and pressure
    this.currentWeather.airDensity = this.calculateAirDensity(
      this.currentWeather.temperature,
      this.currentWeather.pressure,
      this.currentWeather.humidity
    );
    
    // Calculate track temperature (usually 10-15°C higher than air)
    const trackTempOffset = 10 + (this.currentWeather.precipitation > 0 ? -5 : 0);
    this.currentWeather.trackTemperature = this.currentWeather.temperature + trackTempOffset;
    
    // Calculate visibility based on precipitation and humidity
    this.currentWeather.visibility = this.calculateVisibility(
      this.currentWeather.precipitation,
      this.currentWeather.humidity
    );
  }

  /**
   * Calculate air density
   */
  calculateAirDensity(temperature, pressure, humidity) {
    // Simplified air density calculation
    const R = 287.05; // Gas constant for dry air
    const temperatureKelvin = temperature + 273.15;
    
    // Account for humidity
    const vaporPressure = this.calculateVaporPressure(temperature, humidity);
    const dryAirPressure = pressure - vaporPressure;
    
    return dryAirPressure / (R * temperatureKelvin);
  }

  /**
   * Calculate vapor pressure
   */
  calculateVaporPressure(temperature, humidity) {
    // Magnus formula for vapor pressure
    const es = 6.112 * Math.exp((17.67 * temperature) / (temperature + 243.5));
    return (humidity / 100) * es;
  }

  /**
   * Calculate visibility
   */
  calculateVisibility(precipitation, humidity) {
    let visibility = 10000; // Base visibility in meters
    
    // Reduce visibility based on precipitation
    if (precipitation > 0) {
      visibility *= (1 - precipitation / 20); // Max 50% reduction
    }
    
    // Reduce visibility based on humidity
    if (humidity > 80) {
      visibility *= (1 - (humidity - 80) / 100); // Max 20% reduction
    }
    
    return Math.max(visibility, 100); // Minimum 100m visibility
  }

  /**
   * Get random value in range
   */
  randomInRange(range) {
    if (typeof range === 'number') {
      return range;
    }
    
    return range.min + Math.random() * (range.max - range.min);
  }

  /**
   * Set weather conditions manually
   */
  setWeather(weather) {
    this.currentWeather = { ...this.currentWeather, ...weather };
    this.calculateDerivedValues();
  }

  /**
   * Get current weather
   */
  getCurrentWeather() {
    return { ...this.currentWeather };
  }

  /**
   * Get weather forecast
   */
  getForecast(minutes = 60) {
    // Generate forecast based on current pattern
    const forecast = [];
    const steps = Math.ceil(minutes / 5); // 5-minute intervals
    
    for (let i = 0; i < steps; i++) {
      const time = new Date(Date.now() + (i * 5 * 60 * 1000));
      const weather = this.generateForecastWeather(i * 5);
      
      forecast.push({
        time,
        weather
      });
    }
    
    return forecast;
  }

  /**
   * Generate forecast weather
   */
  generateForecastWeather(minutesAhead) {
    const pattern = this.weatherPatterns[this.currentPattern];
    
    // Add some variation for forecast
    const variation = 0.1; // 10% variation
    
    return {
      temperature: this.currentWeather.temperature + (Math.random() - 0.5) * variation * 10,
      humidity: this.currentWeather.humidity + (Math.random() - 0.5) * variation * 20,
      precipitation: this.currentWeather.precipitation + (Math.random() - 0.5) * variation * 2,
      windSpeed: this.currentWeather.windSpeed + (Math.random() - 0.5) * variation * 5,
      cloudCover: this.currentWeather.cloudCover + (Math.random() - 0.5) * variation * 20
    };
  }

  /**
   * Calculate weather impact on performance
   */
  calculatePerformanceImpact(carId, driverId) {
    const weather = this.currentWeather;
    const impacts = {
      engine: 0,
      aerodynamics: 0,
      tires: 0,
      visibility: 0,
      overall: 0
    };
    
    // Engine performance impact
    impacts.engine = this.calculateEngineImpact(weather);
    
    // Aerodynamics impact
    impacts.aerodynamics = this.calculateAerodynamicsImpact(weather);
    
    // Tire performance impact
    impacts.tires = this.calculateTireImpact(weather);
    
    // Visibility impact
    impacts.visibility = this.calculateVisibilityImpact(weather);
    
    // Overall impact
    impacts.overall = (impacts.engine + impacts.aerodynamics + impacts.tires + impacts.visibility) / 4;
    
    return impacts;
  }

  /**
   * Calculate engine performance impact
   */
  calculateEngineImpact(weather) {
    // Higher temperature = lower engine performance
    const tempImpact = (weather.temperature - 25) * -0.5; // -0.5% per °C above 25°C
    
    // Higher humidity = lower engine performance
    const humidityImpact = (weather.humidity - 60) * -0.1; // -0.1% per % above 60%
    
    // Higher altitude (lower pressure) = lower engine performance
    const pressureImpact = (weather.pressure - 1013.25) * 0.1; // +0.1% per hPa above 1013.25
    
    return Math.max(-20, Math.min(20, tempImpact + humidityImpact + pressureImpact));
  }

  /**
   * Calculate aerodynamics impact
   */
  calculateAerodynamicsImpact(weather) {
    // Higher air density = more downforce but more drag
    const densityImpact = (weather.airDensity - 1.225) * 10; // +1% per 0.1 kg/m³ above 1.225
    
    // Wind impact
    const windImpact = weather.windSpeed * -0.2; // -0.2% per km/h wind
    
    return Math.max(-15, Math.min(15, densityImpact + windImpact));
  }

  /**
   * Calculate tire impact
   */
  calculateTireImpact(weather) {
    // Track temperature impact
    const trackTempImpact = (weather.trackTemperature - 35) * -0.3; // -0.3% per °C above 35°C
    
    // Precipitation impact
    const rainImpact = weather.precipitation * -5; // -5% per mm/h
    
    // Humidity impact
    const humidityImpact = (weather.humidity - 60) * -0.1; // -0.1% per % above 60%
    
    return Math.max(-30, Math.min(10, trackTempImpact + rainImpact + humidityImpact));
  }

  /**
   * Calculate visibility impact
   */
  calculateVisibilityImpact(weather) {
    // Lower visibility = more difficult driving
    const visibilityImpact = (weather.visibility - 10000) * -0.001; // -0.1% per 100m below 10km
    
    // Precipitation impact
    const rainImpact = weather.precipitation * -2; // -2% per mm/h
    
    return Math.max(-20, Math.min(0, visibilityImpact + rainImpact));
  }

  /**
   * Get weather statistics
   */
  getStats() {
    return {
      currentPattern: this.currentPattern,
      patternDuration: this.patternDuration,
      historySize: this.weatherHistory.length,
      isDynamic: this.isDynamic
    };
  }

  /**
   * Export weather data
   */
  export(format = 'json') {
    const data = {
      current: this.currentWeather,
      forecast: this.getForecast(),
      stats: this.getStats(),
      timestamp: performance.now()
    };
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.exportToCSV(data);
      default:
        return data;
    }
  }

  /**
   * Export to CSV format
   */
  exportToCSV(data) {
    const csv = [];
    
    // Add headers
    csv.push('Timestamp,Temperature,Humidity,Pressure,WindSpeed,WindDirection,CloudCover,Precipitation,Visibility,TrackTemperature,AirDensity');
    
    // Add current weather
    const current = data.current;
    csv.push(`${data.timestamp},${current.temperature},${current.humidity},${current.pressure},${current.windSpeed},${current.windDirection},${current.cloudCover},${current.precipitation},${current.visibility},${current.trackTemperature},${current.airDensity}`);
    
    return csv.join('\n');
  }
}
