# 🏎️ VelocityForge - Competitive Mobility Systems Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> **A lightweight, real-time competitive mobility simulator that models multiple moving agents, dynamic events, and live leaderboards across various racing and mobility scenarios.**

## 🚀 Overview

VelocityForge is a sophisticated simulation engine designed to model competitive mobility scenarios with real-time agent behavior, dynamic events, and comprehensive leaderboard systems. Built for performance and realism, it supports multiple racing disciplines and mobility applications.

### 🏆 Key Features

- **Real-Time Multi-Agent Simulation**: Support for 1000+ agents with sub-10ms latency
- **Multiple Racing Disciplines**: Formula 1, Formula E, MotoGP, Drone Racing, Supply Chain, Traffic Flow
- **Dynamic Event System**: Weather changes, incidents, pit stops, safety cars, overtakes
- **Live Leaderboards**: Real-time position tracking and statistics
- **Real Driver Data**: Authentic F1 drivers, teams, and performance metrics
- **Modular Architecture**: Extensible design for custom scenarios
- **High Performance**: Optimized for real-time simulation and visualization

## 🏁 Supported Scenarios

### Formula 1 Grand Prix
- **Real F1 Drivers**: Max Verstappen, Lewis Hamilton, Charles Leclerc, and all 2024/2025 season drivers
- **Authentic Teams**: Red Bull Racing, Mercedes, Ferrari, McLaren, and all current F1 teams
- **Real Tracks**: Monaco, Silverstone, Spa-Francorchamps, Monza, Interlagos
- **F1 Physics**: Downforce, tire degradation, fuel consumption, ERS, DRS
- **Race Events**: Safety car, virtual safety car, red flags, pit stops
- **Live Commentary**: Realistic F1-style commentary with David Croft, Martin Brundle, and more
- **Dynamic Events**: Overtaking, incidents, pit stops, weather changes with live commentary

### Formula E Championship
- **Electric Racing**: Battery management, energy recovery, attack mode
- **Street Circuits**: Urban racing with tight corners and energy strategy
- **FanBoost**: Dynamic performance boosts based on fan engagement

### MotoGP Racing
- **Motorcycle Physics**: Lean angles, tire grip, aerodynamics
- **Rider Behavior**: Aggressive overtaking, defensive riding
- **Track Conditions**: Weather impact on motorcycle performance

### Drone Racing Championship
- **High-Speed Maneuvers**: 3D flight paths, obstacle navigation
- **FPV Racing**: First-person view simulation
- **Battery Life**: Critical energy management

### Supply Chain Racing
- **Logistics Simulation**: Delivery optimization, route planning
- **Fleet Management**: Multiple vehicle coordination
- **Real-Time Tracking**: GPS simulation and delivery status

### Traffic Flow Management
- **Urban Mobility**: City traffic simulation
- **Smart Traffic**: AI-controlled traffic lights and routing
- **Congestion Management**: Dynamic traffic flow optimization

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/rv1304/f1.git
cd f1

# Install dependencies
npm install

# Run F1 Grand Prix simulation
npm run real-f1

# Run specific track
npm run f1:monaco
npm run f1:silverstone
npm run f1:spa
```

## 🎮 Usage

### F1 Grand Prix Simulation

```bash
# Default Monaco Grand Prix
npm run real-f1

# Specific tracks
npm run f1:monaco        # Monaco Grand Prix
npm run f1:silverstone   # British Grand Prix  
npm run f1:spa           # Belgian Grand Prix
npm run f1:monza         # Italian Grand Prix
npm run f1:interlagos    # Brazilian Grand Prix
```

### 🎤 F1 Simulator with Live Commentary

```bash
# F1 simulator with live commentary
npm run f1:commentary

# Specific tracks with commentary
npm run f1:monaco:commentary        # Monaco with commentary
npm run f1:silverstone:commentary   # Silverstone with commentary
npm run f1:spa:commentary           # Spa with commentary
npm run f1:monza:commentary         # Monza with commentary
npm run f1:interlagos:commentary    # Interlagos with commentary

# Demo commentary system only
npm run commentary:demo
```

### Other Racing Disciplines

```bash
# Formula E Championship
npm run formula-e

# MotoGP Racing
npm run motogp

# Drone Racing
npm run drones

# Supply Chain Racing
npm run supply-chain

# Traffic Flow Management
npm run traffic
```

### Advanced Features

```bash
# Live F1 race tracking (when race is active)
npm run f1:tracker

# Comprehensive simulator (auto-detects live vs simulation)
npm run f1:comprehensive

# Real-time F1 simulation with live data
npm run f1:realtime
```

## 🏎️ F1 Grand Prix Features

### Real Driver Data
- **Current Season**: All 2024/2025 F1 drivers with authentic names and teams
- **Performance Metrics**: Realistic speed, acceleration, and racing behavior
- **Team Dynamics**: Authentic team colors and performance characteristics

### Dynamic Race Events
- **Weather System**: Real-time weather changes affecting performance
- **Safety Car**: Deployed during incidents, affects race strategy
- **Pit Stops**: Strategic tire changes and fuel management
- **Incidents**: Realistic collision and mechanical failure simulation
- **Overtaking**: Dynamic position changes based on driver skill

### Live Statistics
- **Real-Time Leaderboard**: Live position tracking with gaps
- **Lap Times**: Individual and best lap time tracking
- **Race Statistics**: Incidents, pit stops, overtakes, fastest laps
- **Performance Metrics**: Speed, fuel level, tire wear, ERS charge

## 🏗️ Architecture

### Core Components

```
src/
├── core/                 # Simulation engine
│   └── SimulationEngine.js
├── physics/              # Physics calculations
│   ├── PhysicsEngine.js
│   └── CollisionDetector.js
├── agents/               # Agent management
│   ├── AgentManager.js
│   └── F1Agent.js
├── events/               # Event system
│   └── EventBus.js
├── data/                 # Driver and track data
│   ├── F1Drivers.js
│   ├── F1Cars.js
│   └── F1Tracks.js
├── integration/          # External data sources
│   ├── F1DataIntegration.js
│   ├── RealTimeF1Integration.js
│   └── RealTimeWeatherIntegration.js
├── prediction/           # Race prediction algorithms
│   └── RacePredictionSystem.js
├── systems/              # Game systems
│   └── WeatherSystem.js
└── utils/                # Utilities
    ├── Vector3.js
    ├── Leaderboard.js
    └── ConsoleDashboard.js
```

### Event-Driven Architecture
- **Pub-Sub System**: Decoupled event handling
- **Real-Time Updates**: Live data streaming and processing
- **Modular Design**: Easy to extend with new scenarios

## 📊 Performance

- **Latency**: Sub-10ms simulation updates
- **Scalability**: 1000+ concurrent agents
- **Memory**: Optimized for long-running simulations
- **CPU**: Efficient physics calculations and event processing

## 🔧 Configuration

### Environment Variables

```bash
# Weather API Keys (optional)
OPENWEATHERMAP_API_KEY=your_api_key
WEATHERAPI_API_KEY=your_api_key

# F1 Data API Configuration
F1_API_RATE_LIMIT=1000
F1_CACHE_DURATION=300000
```

### Custom Scenarios

```javascript
// Create custom racing scenario
const customScenario = {
  name: 'Custom Race',
  trackLength: 4.5, // km
  maxLaps: 50,
  agentCount: 20,
  weather: 'dynamic',
  events: ['incidents', 'pit_stops', 'overtakes']
};
```

## 🏆 Competitive Features

### Real-Time Competition
- **Live Leaderboards**: Real-time position updates
- **Dynamic Events**: Unpredictable race scenarios
- **Performance Tracking**: Detailed statistics and analytics
- **Multi-Agent AI**: Intelligent driver behavior

## 🎤 Live Commentary System

### F1-Style Commentary
- **Professional Commentators**: David Croft, Martin Brundle, Karun Chandhok, Jenson Button
- **Dynamic Commentary**: Real-time reactions to race events
- **Event-Based Commentary**: Overtaking, incidents, pit stops, weather changes
- **Realistic Timing**: Natural commentary intervals and pacing

### Commentary Features
- **Race Start**: "LIGHTS OUT AND AWAY WE GO!"
- **Overtaking**: "WHAT A MOVE! {driver} goes around the outside!"
- **Incidents**: "OH NO! {driver} has an incident!"
- **Pit Stops**: "Lightning fast pit stop for {driver}!"
- **Weather**: "The rain is coming down! This changes everything!"
- **Safety Car**: "SAFETY CAR DEPLOYED! The race is neutralized!"
- **Lap Progress**: "Lap {lap} of {totalLaps} here in Monaco!"

### Commentary Controls
- **Toggle On/Off**: Enable or disable commentary during race
- **Event Integration**: Automatic commentary for race events
- **Customizable Timing**: Adjustable commentary intervals
- **Multiple Commentators**: Rotating commentary team

### Simulation Accuracy
- **Realistic Physics**: Authentic racing dynamics
- **Weather Impact**: Dynamic weather affecting performance
- **Strategic Elements**: Pit stops, tire management, fuel strategy
- **Incident Simulation**: Realistic collision and failure modeling

## 🚀 Future Roadmap

- [ ] **Web Dashboard**: Browser-based visualization
- [ ] **Multiplayer Support**: Real-time competitive racing
- [ ] **Machine Learning**: AI-driven race predictions
- [ ] **VR Support**: Virtual reality racing experience
- [ ] **Mobile App**: iOS/Android companion app
- [ ] **API Integration**: RESTful API for external systems
- [ ] **Cloud Deployment**: Scalable cloud-based simulation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Install development dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run benchmarks
npm run benchmark
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **F1 Data Sources**: OpenF1 API, Ergast API for authentic racing data
- **Weather Data**: OpenWeatherMap, WeatherAPI for real-time conditions
- **Racing Community**: Inspiration from Formula 1, Formula E, and motorsport enthusiasts

## 📞 Contact

- **GitHub**: [@rv1304](https://github.com/rv1304)
- **Project**: [VelocityForge F1 Simulator](https://github.com/rv1304/f1)

---

**Built with ❤️ for the racing community**

*Experience the thrill of competitive racing with VelocityForge - where every lap counts!*