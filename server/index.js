/**
 * VelocityForge Racing Simulator - Backend Server
 * 
 * Real-time F1 racing simulation server with WebSocket support
 * Features:
 * - Real-time race data streaming
 * - REST API for race management
 * - Multiple simulation modes
 * - Live telemetry and analytics
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { RealF1Simulator } from '../real-f1-simulator.js';
import { F1CommentarySystem } from '../f1-commentary.js';
import { MultiModalSimulator } from '../src/enhanced/MultiModalSimulator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VelocityForgeServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.port = process.env.PORT || 3001;
    
    // Race simulators
    this.activeRaces = new Map();
    this.clients = new Set();
    
    // Initialize server
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../dashboard/build')));
    
    // Add request logging
    this.app.use((req, res, next) => {
      console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }

  /**
   * Setup REST API routes
   */
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
      const simulator = new RealF1Simulator();
      const tracks = simulator.getF1Tracks();
      res.json({ tracks });
    });

    // Start new race
    this.app.post('/api/race/start', async (req, res) => {
      try {
        const { mode = 'f1', track = 'monaco', config = {} } = req.body;
        const raceId = `race_${Date.now()}`;
        
        console.log(`🏁 Starting new race: ${raceId} (${mode} at ${track})`);
        
        // Create race simulator
        const race = await this.createRaceSimulator(mode, track, config);
        race.raceId = raceId;
        
        // Store active race
        this.activeRaces.set(raceId, race);
        
        // Setup race event listeners
        this.setupRaceEventListeners(race, raceId);
        
        // Start the race
        await race.start();
        
        res.json({ 
          success: true, 
          raceId,
          mode,
          track,
          message: 'Race started successfully' 
        });
        
        // Broadcast race start to all clients
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
        
        race.stop();
        this.activeRaces.delete(raceId);
        
        res.json({ 
          success: true, 
          message: 'Race stopped successfully' 
        });
        
        // Broadcast race stop
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
        data: race.getStatus()
      });
    });

    // Get race leaderboard
    this.app.get('/api/race/:raceId/leaderboard', (req, res) => {
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
        data: race.getLeaderboard()
      });
    });

    // Get race events
    this.app.get('/api/race/:raceId/events', (req, res) => {
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
        data: race.events || []
      });
    });

    // Get active races
    this.app.get('/api/races', (req, res) => {
      const races = Array.from(this.activeRaces.entries()).map(([id, race]) => ({
        id,
        mode: race.mode || 'f1',
        track: race.track?.name || 'Unknown',
        status: race.isRunning ? 'running' : 'stopped',
        participants: race.drivers?.length || 0,
        startTime: race.startTime || Date.now()
      }));
      
      res.json({ success: true, data: races });
    });

    // Serve React app for any other routes
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dashboard/build/index.html'));
    });
  }

  /**
   * Setup WebSocket connections
   */
  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log(`🔌 New WebSocket connection from ${req.socket.remoteAddress}`);
      
      // Add client to active connections
      this.clients.add(ws);
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection_established',
        data: {
          message: 'Connected to VelocityForge Racing Server',
          timestamp: Date.now(),
          activeRaces: Array.from(this.activeRaces.keys())
        }
      }));
      
      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error);
        }
      });
      
      // Handle client disconnect
      ws.on('close', () => {
        console.log(`🔌 WebSocket connection closed`);
        this.clients.delete(ws);
      });
      
      // Handle errors
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  /**
   * Handle WebSocket messages from clients
   */
  handleWebSocketMessage(ws, data) {
    switch (data.type) {
      case 'subscribe_to_race':
        // Client wants to receive updates for a specific race
        const { raceId } = data;
        if (this.activeRaces.has(raceId)) {
          ws.raceSubscription = raceId;
          console.log(`📡 Client subscribed to race: ${raceId}`);
        }
        break;
        
      case 'get_race_data':
        // Client requesting current race data
        const race = this.activeRaces.get(data.raceId);
        if (race) {
          ws.send(JSON.stringify({
            type: 'race_data',
            data: {
              raceId: data.raceId,
              leaderboard: race.getLeaderboard(),
              status: race.getStatus(),
              events: race.events || []
            }
          }));
        }
        break;
        
      default:
        console.log(`🔍 Unknown WebSocket message type: ${data.type}`);
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }

  /**
   * Broadcast message to clients subscribed to a specific race
   */
  broadcastToRace(raceId, message) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1 && client.raceSubscription === raceId) {
        client.send(messageStr);
      }
    });
  }

  /**
   * Create race simulator based on mode
   */
  async createRaceSimulator(mode, track, config) {
    // Use multi-modal simulator factory
    const multiModal = new MultiModalSimulator(mode);
    const simulator = await multiModal.create(track, config);
    
    return simulator;
  }

  /**
   * Setup event listeners for a race
   */
  setupRaceEventListeners(race, raceId) {
    // Real-time updates every second
    const updateInterval = setInterval(() => {
      if (!race.isRunning) {
        clearInterval(updateInterval);
        return;
      }
      
      // Broadcast live race data
      this.broadcastToRace(raceId, {
        type: 'race_update',
        data: {
          raceId,
          timestamp: Date.now(),
          leaderboard: race.getLeaderboard(),
          raceState: race.raceState,
          events: race.events.slice(-5) // Last 5 events
        }
      });
    }, 1000);
    
    // Race events
    race.on('race_event', (event) => {
      this.broadcastToRace(raceId, {
        type: 'race_event',
        data: {
          raceId,
          event,
          timestamp: Date.now()
        }
      });
    });
    
    // Race finished
    race.on('race_finished', (results) => {
      this.broadcast({
        type: 'race_finished',
        data: {
          raceId,
          results,
          timestamp: Date.now()
        }
      });
      
      // Clean up after 5 minutes
      setTimeout(() => {
        this.activeRaces.delete(raceId);
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Start the server
   */
  start() {
    this.server.listen(this.port, () => {
      console.log(`🚀 VelocityForge Racing Server started on port ${this.port}`);
      console.log(`📊 Dashboard: http://localhost:${this.port}`);
      console.log(`📡 WebSocket: ws://localhost:${this.port}`);
      console.log(`🔗 API: http://localhost:${this.port}/api`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', this.shutdown.bind(this));
    process.on('SIGTERM', this.shutdown.bind(this));
  }

  /**
   * Shutdown server gracefully
   */
  shutdown() {
    console.log('\n🛑 Shutting down VelocityForge Racing Server...');
    
    // Stop all active races
    this.activeRaces.forEach((race, raceId) => {
      console.log(`🏁 Stopping race: ${raceId}`);
      race.stop();
    });
    
    // Close WebSocket connections
    this.clients.forEach(client => {
      client.terminate();
    });
    
    // Close server
    this.server.close(() => {
      console.log('✅ Server shutdown complete');
      process.exit(0);
    });
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new VelocityForgeServer();
  server.start();
}

export { VelocityForgeServer };