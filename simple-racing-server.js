/**
 * VelocityForge Real Racing Server
 * 
 * Simple, working racing simulation with real-time features
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RacingServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.port = process.env.PORT || 3001;
    
    // Active races and simulation data
    this.activeRaces = new Map();
    this.clients = new Set();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.initializeSimulation();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../dashboard/build')));
    
    this.app.use((req, res, next) => {
      console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: Date.now(),
        activeRaces: this.activeRaces.size,
        connectedClients: this.clients.size
      });
    });

    // Get available race modes
    this.app.get('/api/modes', (req, res) => {
      res.json({
        modes: [
          { id: 'f1', name: 'Formula 1', description: 'Elite single-seater racing' },
          { id: 'formulaE', name: 'Formula E', description: 'Electric street racing' },
          { id: 'motogp', name: 'MotoGP', description: 'Premier motorcycle racing' },
          { id: 'drones', name: 'Drone Racing', description: 'High-speed FPV drone competition' },
          { id: 'logistics', name: 'Supply Chain', description: 'Delivery fleet optimization' },
          { id: 'traffic', name: 'Traffic Simulation', description: 'Urban traffic flow analysis' }
        ]
      });
    });

    // Get available tracks
    this.app.get('/api/tracks', (req, res) => {
      res.json({ 
        tracks: {
          monaco: {
            name: 'Monaco Grand Prix',
            location: 'Monte Carlo, Monaco',
            length: '3.337 km',
            turns: 19
          },
          silverstone: {
            name: 'British Grand Prix',
            location: 'Silverstone, United Kingdom',
            length: '5.891 km',
            turns: 18
          },
          spa: {
            name: 'Belgian Grand Prix',
            location: 'Spa-Francorchamps, Belgium',
            length: '7.004 km',
            turns: 20
          }
        }
      });
    });

    // Start new race
    this.app.post('/api/race/start', async (req, res) => {
      try {
        const { mode = 'f1', track = 'monaco', config = {} } = req.body;
        const raceId = `race_${Date.now()}`;
        
        console.log(`🏁 Starting new race: ${raceId} (${mode} at ${track})`);
        
        const race = this.createRace(raceId, mode, track, config);
        this.activeRaces.set(raceId, race);
        
        this.startRaceSimulation(raceId);
        
        res.json({ 
          success: true, 
          raceId,
          mode,
          track,
          message: 'Race started successfully' 
        });
        
        this.broadcast({
          type: 'race_started',
          data: { raceId, mode, track, timestamp: Date.now() }
        });
        
      } catch (error) {
        console.error('❌ Failed to start race:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    });

    // Stop race
    this.app.post('/api/race/:raceId/stop', (req, res) => {
      try {
        const { raceId } = req.params;
        const race = this.activeRaces.get(raceId);
        
        if (!race) {
          return res.status(404).json({ 
            success: false, 
            error: 'Race not found' 
          });
        }
        
        clearInterval(race.updateInterval);
        this.activeRaces.delete(raceId);
        
        res.json({ 
          success: true, 
          message: 'Race stopped successfully' 
        });
        
        this.broadcast({
          type: 'race_stopped',
          data: { raceId, timestamp: Date.now() }
        });
        
      } catch (error) {
        console.error('❌ Failed to stop race:', error);
        res.status(500).json({ 
          success: false, 
          error: error.message 
        });
      }
    });

    // Get race status
    this.app.get('/api/race/:raceId', (req, res) => {
      const { raceId } = req.params;
      const race = this.activeRaces.get(raceId);
      
      if (!race) {
        return res.status(404).json({ 
          success: false, 
          error: 'Race not found' 
        });
      }
      
      res.json({
        success: true,
        data: this.getRaceStatus(race)
      });
    });

    // Serve React app
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dashboard/build/index.html'));
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log(`🔌 New WebSocket connection`);
      
      this.clients.add(ws);
      
      ws.send(JSON.stringify({
        type: 'connection_established',
        data: {
          message: 'Connected to VelocityForge Racing Server',
          timestamp: Date.now(),
          activeRaces: Array.from(this.activeRaces.keys())
        }
      }));
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log(`🔌 WebSocket connection closed`);
        this.clients.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  handleWebSocketMessage(ws, data) {
    switch (data.type) {
      case 'subscribe_to_race':
        const { raceId } = data;
        if (this.activeRaces.has(raceId)) {
          ws.raceSubscription = raceId;
          console.log(`📡 Client subscribed to race: ${raceId}`);
        }
        break;
        
      case 'get_race_data':
        const race = this.activeRaces.get(data.raceId);
        if (race) {
          ws.send(JSON.stringify({
            type: 'race_data',
            data: {
              raceId: data.raceId,
              leaderboard: race.leaderboard,
              raceState: race.raceState,
              events: race.events
            }
          }));
        }
        break;
    }
  }

  initializeSimulation() {
    // Initialize simulation data
    this.drivers = this.getF1Drivers();
    this.tracks = this.getTracks();
  }

  getF1Drivers() {
    return [
      { id: 1, name: 'Max VERSTAPPEN', team: 'Red Bull Racing', number: 1, nationality: 'NED', color: '🔴' },
      { id: 2, name: 'Sergio PEREZ', team: 'Red Bull Racing', number: 11, nationality: 'MEX', color: '🔴' },
      { id: 3, name: 'Charles LECLERC', team: 'Ferrari', number: 16, nationality: 'MON', color: '🔴' },
      { id: 4, name: 'Carlos SAINZ', team: 'Ferrari', number: 55, nationality: 'ESP', color: '🔴' },
      { id: 5, name: 'Lando NORRIS', team: 'McLaren', number: 4, nationality: 'GBR', color: '🟠' },
      { id: 6, name: 'Oscar PIASTRI', team: 'McLaren', number: 81, nationality: 'AUS', color: '🟠' },
      { id: 7, name: 'Lewis HAMILTON', team: 'Mercedes', number: 44, nationality: 'GBR', color: '🔵' },
      { id: 8, name: 'George RUSSELL', team: 'Mercedes', number: 63, nationality: 'GBR', color: '🔵' },
      { id: 9, name: 'Fernando ALONSO', team: 'Aston Martin', number: 14, nationality: 'ESP', color: '🟢' },
      { id: 10, name: 'Lance STROLL', team: 'Aston Martin', number: 18, nationality: 'CAN', color: '🟢' },
      { id: 11, name: 'Pierre GASLY', team: 'Alpine', number: 10, nationality: 'FRA', color: '🟣' },
      { id: 12, name: 'Esteban OCON', team: 'Alpine', number: 31, nationality: 'FRA', color: '🟣' },
      { id: 13, name: 'Alexander ALBON', team: 'Williams', number: 23, nationality: 'THA', color: '🔵' },
      { id: 14, name: 'Logan SARGEANT', team: 'Williams', number: 2, nationality: 'USA', color: '🔵' },
      { id: 15, name: 'Yuki TSUNODA', team: 'AlphaTauri', number: 22, nationality: 'JPN', color: '🔵' },
      { id: 16, name: 'Daniel RICCIARDO', team: 'AlphaTauri', number: 3, nationality: 'AUS', color: '🔵' },
      { id: 17, name: 'Valtteri BOTTAS', team: 'Alfa Romeo', number: 77, nationality: 'FIN', color: '🔴' },
      { id: 18, name: 'Zhou GUANYU', team: 'Alfa Romeo', number: 24, nationality: 'CHN', color: '🔴' },
      { id: 19, name: 'Kevin MAGNUSSEN', team: 'Haas', number: 20, nationality: 'DEN', color: '⚫' },
      { id: 20, name: 'Nico HULKENBERG', team: 'Haas', number: 27, nationality: 'GER', color: '⚫' }
    ];
  }

  getTracks() {
    return {
      monaco: { name: 'Monaco GP', laps: 78, length: 3.337 },
      silverstone: { name: 'British GP', laps: 52, length: 5.891 },
      spa: { name: 'Belgian GP', laps: 44, length: 7.004 }
    };
  }

  createRace(raceId, mode, trackId, config) {
    const track = this.tracks[trackId] || this.tracks.monaco;
    const drivers = this.drivers.map(driver => ({
      ...driver,
      position: 0,
      speed: 0,
      totalTime: 0,
      lapTime: 0,
      progress: Math.random() * 10 // Initial spread
    }));

    return {
      id: raceId,
      mode,
      track,
      drivers,
      leaderboard: drivers,
      raceState: {
        lap: 1,
        totalLaps: track.laps,
        time: 0,
        weather: 'Clear',
        temperature: 25,
        isRunning: true
      },
      events: [],
      startTime: Date.now()
    };
  }

  startRaceSimulation(raceId) {
    const race = this.activeRaces.get(raceId);
    if (!race) return;

    let lapCounter = 0;

    race.updateInterval = setInterval(() => {
      this.updateRaceSimulation(race);
      
      // Broadcast updates every second
      this.broadcastToRace(raceId, {
        type: 'race_update',
        data: {
          raceId,
          timestamp: Date.now(),
          leaderboard: race.leaderboard,
          raceState: race.raceState,
          events: race.events.slice(-5)
        }
      });

      // Check race completion
      if (race.raceState.lap >= race.raceState.totalLaps) {
        this.finishRace(raceId);
      }
    }, 1000);
  }

  updateRaceSimulation(race) {
    race.raceState.time += 1000;
    
    // Update each driver
    race.drivers.forEach(driver => {
      // Realistic speed variation (200-350 km/h)
      const baseSpeed = 280 + (Math.random() - 0.5) * 60;
      driver.speed = Math.max(200, Math.min(350, baseSpeed));
      
      // Update progress (% around track)
      driver.progress += (driver.speed / 3600) * (1000 / race.track.length) * 100;
      
      // Lap completion
      if (driver.progress >= 100) {
        driver.progress -= 100;
        race.raceState.lap = Math.min(race.raceState.lap + 1, race.raceState.totalLaps);
        
        // Generate lap time
        const lapTime = 70000 + Math.random() * 10000; // 70-80 seconds
        driver.lapTime = lapTime;
        driver.totalTime += lapTime;
        
        // Add lap event
        race.events.push({
          type: 'lap_complete',
          driver: driver.name,
          lap: race.raceState.lap,
          time: lapTime,
          timestamp: Date.now()
        });
      }
      
      // Random events
      if (Math.random() < 0.001) { // 0.1% chance per update
        this.generateRaceEvent(race, driver);
      }
    });
    
    // Update leaderboard (sort by total time)
    race.leaderboard = [...race.drivers].sort((a, b) => a.totalTime - b.totalTime);
    race.leaderboard.forEach((driver, index) => {
      driver.position = index + 1;
    });
  }

  generateRaceEvent(race, driver) {
    const events = ['overtake', 'pit_stop', 'speed_boost', 'incident'];
    const eventType = events[Math.floor(Math.random() * events.length)];
    
    const event = {
      type: eventType,
      driver: driver.name,
      lap: race.raceState.lap,
      timestamp: Date.now()
    };

    switch (eventType) {
      case 'overtake':
        event.message = `${driver.name} makes a brilliant overtake!`;
        break;
      case 'pit_stop':
        event.message = `${driver.name} enters the pit lane`;
        driver.totalTime += 25000; // 25 second pit stop
        break;
      case 'speed_boost':
        event.message = `${driver.name} activates DRS boost`;
        driver.speed += 15;
        break;
      case 'incident':
        event.message = `${driver.name} has a minor incident`;
        driver.speed *= 0.8;
        break;
    }
    
    race.events.push(event);
  }

  finishRace(raceId) {
    const race = this.activeRaces.get(raceId);
    if (!race) return;

    clearInterval(race.updateInterval);
    race.raceState.isRunning = false;

    this.broadcast({
      type: 'race_finished',
      data: {
        raceId,
        results: race.leaderboard,
        timestamp: Date.now()
      }
    });

    console.log(`🏁 Race ${raceId} finished!`);
  }

  getRaceStatus(race) {
    return {
      id: race.id,
      mode: race.mode,
      track: race.track,
      raceState: race.raceState,
      leaderboard: race.leaderboard,
      events: race.events.slice(-10)
    };
  }

  broadcast(message) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }

  broadcastToRace(raceId, message) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1 && client.raceSubscription === raceId) {
        client.send(messageStr);
      }
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`
🏎️ ================================================================================
   VELOCITYFORGE RACING SERVER STARTED
🏎️ ================================================================================

🚀 Server running on port ${this.port}
📊 Dashboard: http://localhost:${this.port}
📡 WebSocket: ws://localhost:${this.port}
🔗 API: http://localhost:${this.port}/api

🏁 READY FOR RACING! Start a race from the dashboard.
      `);
    });

    process.on('SIGINT', this.shutdown.bind(this));
    process.on('SIGTERM', this.shutdown.bind(this));
  }

  shutdown() {
    console.log('\n🛑 Shutting down VelocityForge Racing Server...');
    
    this.activeRaces.forEach((race, raceId) => {
      if (race.updateInterval) {
        clearInterval(race.updateInterval);
      }
    });
    
    this.clients.forEach(client => {
      client.terminate();
    });
    
    this.server.close(() => {
      console.log('✅ Server shutdown complete');
      process.exit(0);
    });
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new RacingServer();
  server.start();
}

export { RacingServer };