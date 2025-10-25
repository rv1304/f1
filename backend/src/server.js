/**
 * Competitive Mobility Systems Simulator - WebSocket & REST API Server
 * Real-time racing simulator with Express.js and WebSocket support
 * 
 * Features:
 * - REST API for race management
 * - WebSocket real-time communication
 * - Race state broadcasting
 * - Agent control commands
 * - Event logging and replay
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { SimulationEngine } from './simulationEngine.js';

class RacingServer {
  constructor(config = {}) {
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ 
      server: this.server, 
      path: '/race' 
    });
    
    this.port = config.port || 4000;
    this.races = new Map(); // Store active races
    this.clients = new Map(); // Store WebSocket connections
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    
    console.log('🏎️  Racing Server initialized');
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.static('public'));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
    
    // Error handling
    this.app.use((err, req, res, next) => {
      console.error('❌ Server error:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
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
        timestamp: new Date().toISOString(),
        activeRaces: this.races.size,
        connectedClients: this.clients.size,
        uptime: process.uptime()
      });
    });

    // Create new race
    this.app.post('/api/races', (req, res) => {
      try {
        const { 
          name = 'Demo Race',
          trackLength = 5000,
          totalLaps = 3,
          tickRate = 10
        } = req.body;

        const raceId = uuidv4();
        const simulation = new SimulationEngine({
          trackLength,
          totalLaps,
          tickRate
        });

        // Setup simulation event handlers
        this.setupSimulationHandlers(raceId, simulation);

        this.races.set(raceId, {
          id: raceId,
          name,
          simulation,
          createdAt: new Date().toISOString(),
          clients: new Set()
        });

        res.json({
          success: true,
          raceId,
          name,
          config: { trackLength, totalLaps, tickRate }
        });

        console.log(`🏁 Created race: ${raceId} (${name})`);

      } catch (error) {
        console.error('❌ Failed to create race:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get race details
    this.app.get('/api/races/:raceId', (req, res) => {
      try {
        const { raceId } = req.params;
        const race = this.races.get(raceId);

        if (!race) {
          return res.status(404).json({
            success: false,
            error: 'Race not found'
          });
        }

        const state = race.simulation.getState();
        
        res.json({
          success: true,
          race: {
            id: race.id,
            name: race.name,
            createdAt: race.createdAt,
            ...state
          }
        });

      } catch (error) {
        console.error('❌ Failed to get race:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Join race as agent
    this.app.post('/api/races/:raceId/join', (req, res) => {
      try {
        const { raceId } = req.params;
        const { 
          agentName = 'Anonymous Agent',
          avatarUrl,
          maxSpeed,
          handling,
          aiPersonality
        } = req.body;

        const race = this.races.get(raceId);
        if (!race) {
          return res.status(404).json({
            success: false,
            error: 'Race not found'
          });
        }

        if (race.simulation.raceStatus === 'running') {
          return res.status(400).json({
            success: false,
            error: 'Cannot join race in progress'
          });
        }

        const agentId = race.simulation.addAgent({
          name: agentName,
          avatarUrl,
          maxSpeed,
          handling,
          aiPersonality
        });

        const token = uuidv4(); // Simple token for WebSocket auth

        res.json({
          success: true,
          agentId,
          token,
          message: 'Successfully joined race'
        });

        console.log(`👤 Agent ${agentName} joined race ${raceId}`);

      } catch (error) {
        console.error('❌ Failed to join race:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Control race (start/pause/reset)
    this.app.post('/api/races/:raceId/control', (req, res) => {
      try {
        const { raceId } = req.params;
        const { action } = req.body; // start, pause, reset

        const race = this.races.get(raceId);
        if (!race) {
          return res.status(404).json({
            success: false,
            error: 'Race not found'
          });
        }

        switch (action) {
          case 'start':
            race.simulation.startRace();
            break;
          case 'pause':
            race.simulation.pauseRace();
            break;
          case 'reset':
            race.simulation.resetRace();
            break;
          default:
            return res.status(400).json({
              success: false,
              error: 'Invalid action'
            });
        }

        res.json({
          success: true,
          action,
          raceStatus: race.simulation.raceStatus
        });

      } catch (error) {
        console.error('❌ Failed to control race:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Control agent
    this.app.post('/api/races/:raceId/agents/:agentId/control', (req, res) => {
      try {
        const { raceId, agentId } = req.params;
        const { action, params = {} } = req.body; // boost, pit, crash

        const race = this.races.get(raceId);
        if (!race) {
          return res.status(404).json({
            success: false,
            error: 'Race not found'
          });
        }

        const success = race.simulation.controlAgent(agentId, action, params);

        res.json({
          success,
          action,
          agentId,
          message: success ? 'Command executed' : 'Command failed'
        });

      } catch (error) {
        console.error('❌ Failed to control agent:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get race results
    this.app.get('/api/races/:raceId/results', (req, res) => {
      try {
        const { raceId } = req.params;
        const race = this.races.get(raceId);

        if (!race) {
          return res.status(404).json({
            success: false,
            error: 'Race not found'
          });
        }

        const results = race.simulation.getFinalResults();
        const statistics = race.simulation.getRaceStatistics();

        res.json({
          success: true,
          results,
          statistics,
          raceStatus: race.simulation.raceStatus
        });

      } catch (error) {
        console.error('❌ Failed to get race results:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Delete race
    this.app.delete('/api/races/:raceId', (req, res) => {
      try {
        const { raceId } = req.params;
        const race = this.races.get(raceId);

        if (!race) {
          return res.status(404).json({
            success: false,
            error: 'Race not found'
          });
        }

        // Notify all connected clients
        this.broadcastToRace(raceId, {
          type: 'race_deleted',
          payload: { raceId }
        });

        // Clean up
        race.clients.forEach(clientId => {
          const client = this.clients.get(clientId);
          if (client) {
            client.ws.close();
            this.clients.delete(clientId);
          }
        });

        this.races.delete(raceId);

        res.json({
          success: true,
          message: 'Race deleted'
        });

        console.log(`🗑️  Deleted race: ${raceId}`);

      } catch (error) {
        console.error('❌ Failed to delete race:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // List all races
    this.app.get('/api/races', (req, res) => {
      try {
        const raceList = Array.from(this.races.values()).map(race => ({
          id: race.id,
          name: race.name,
          createdAt: race.createdAt,
          status: race.simulation.raceStatus,
          agentCount: race.simulation.agents.size,
          clientCount: race.clients.size
        }));

        res.json({
          success: true,
          races: raceList,
          totalRaces: raceList.length
        });

      } catch (error) {
        console.error('❌ Failed to list races:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Quick demo endpoint - creates race with AI agents
    this.app.post('/api/demo', (req, res) => {
      try {
        const { agentCount = 6 } = req.body;

        // Create demo race
        const raceId = uuidv4();
        const simulation = new SimulationEngine({
          trackLength: 5000,
          totalLaps: 3,
          tickRate: 10
        });

        this.setupSimulationHandlers(raceId, simulation);

        // Add AI agents
        const demoAgents = [
          'Lightning McQueen', 'Max Verstappen', 'Lewis Hamilton',
          'Charles Leclerc', 'Lando Norris', 'Fernando Alonso',
          'George Russell', 'Carlos Sainz', 'Sergio Perez', 'Oscar Piastri'
        ];

        for (let i = 0; i < Math.min(agentCount, demoAgents.length); i++) {
          simulation.addAgent({
            name: demoAgents[i],
            maxSpeed: 45 + Math.random() * 15,
            handling: 0.7 + Math.random() * 0.3
          });
        }

        this.races.set(raceId, {
          id: raceId,
          name: 'Demo Race',
          simulation,
          createdAt: new Date().toISOString(),
          clients: new Set()
        });

        // Auto-start after 2 seconds
        setTimeout(() => {
          try {
            simulation.startRace();
          } catch (error) {
            console.error('Failed to auto-start demo race:', error);
          }
        }, 2000);

        res.json({
          success: true,
          raceId,
          agentCount: simulation.agents.size,
          message: 'Demo race created and will start in 2 seconds'
        });

        console.log(`🚀 Created demo race: ${raceId} with ${simulation.agents.size} agents`);

      } catch (error) {
        console.error('❌ Failed to create demo:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Setup WebSocket server
   */
  setupWebSocket() {
    this.wss.on('connection', (ws, request) => {
      const clientId = uuidv4();
      
      console.log(`🔌 New WebSocket connection: ${clientId}`);

      // Store client connection
      this.clients.set(clientId, {
        id: clientId,
        ws,
        raceId: null,
        agentId: null,
        connectedAt: new Date().toISOString()
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection_established',
        payload: {
          clientId,
          timestamp: new Date().toISOString(),
          message: 'Connected to Competitive Mobility Simulator'
        }
      }));

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(clientId, message);
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Invalid message format' }
          }));
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log(`🔌 Client disconnected: ${clientId}`);
        
        const client = this.clients.get(clientId);
        if (client && client.raceId) {
          const race = this.races.get(client.raceId);
          if (race) {
            race.clients.delete(clientId);
          }
        }
        
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
  }

  /**
   * Handle WebSocket messages
   */
  handleWebSocketMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { type, payload = {} } = message;

    switch (type) {
      case 'join_race':
        this.handleJoinRace(clientId, payload);
        break;

      case 'get_race_state':
        this.handleGetRaceState(clientId, payload);
        break;

      case 'control':
        this.handleControlCommand(clientId, payload);
        break;

      case 'chat':
        this.handleChatMessage(clientId, payload);
        break;

      case 'ping':
        client.ws.send(JSON.stringify({
          type: 'pong',
          payload: { timestamp: new Date().toISOString() }
        }));
        break;

      default:
        console.warn(`⚠️  Unknown message type: ${type}`);
        client.ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Unknown message type' }
        }));
    }
  }

  /**
   * Handle race join request
   */
  handleJoinRace(clientId, payload) {
    const { raceId, token, agentId } = payload;
    const client = this.clients.get(clientId);
    const race = this.races.get(raceId);

    if (!race) {
      client.ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Race not found' }
      }));
      return;
    }

    // Update client info
    client.raceId = raceId;
    client.agentId = agentId;
    race.clients.add(clientId);

    // Send current race state
    const state = race.simulation.getState();
    client.ws.send(JSON.stringify({
      type: 'race_joined',
      payload: {
        raceId,
        agentId,
        state
      }
    }));

    console.log(`👤 Client ${clientId} joined race ${raceId}`);
  }

  /**
   * Handle race state request
   */
  handleGetRaceState(clientId, payload) {
    const { raceId } = payload;
    const client = this.clients.get(clientId);
    const race = this.races.get(raceId);

    if (!race) {
      client.ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Race not found' }
      }));
      return;
    }

    const state = race.simulation.getState();
    client.ws.send(JSON.stringify({
      type: 'race_state',
      payload: { state }
    }));
  }

  /**
   * Handle control commands
   */
  handleControlCommand(clientId, payload) {
    const { action, agentId, params = {} } = payload;
    const client = this.clients.get(clientId);

    if (!client.raceId) {
      client.ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Not joined to any race' }
      }));
      return;
    }

    const race = this.races.get(client.raceId);
    if (!race) return;

    const success = race.simulation.controlAgent(agentId, action, params);

    client.ws.send(JSON.stringify({
      type: 'control_result',
      payload: {
        success,
        action,
        agentId
      }
    }));
  }

  /**
   * Handle chat messages
   */
  handleChatMessage(clientId, payload) {
    const { message, level = 'info' } = payload;
    const client = this.clients.get(clientId);

    if (client.raceId) {
      this.broadcastToRace(client.raceId, {
        type: 'chat',
        payload: {
          clientId,
          message,
          level,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Setup simulation event handlers
   */
  setupSimulationHandlers(raceId, simulation) {
    // Broadcast race state updates
    simulation.on('race_state', ({ state }) => {
      this.broadcastToRace(raceId, {
        type: 'race_state',
        payload: { state }
      });
    });

    // Broadcast race events
    simulation.on('race_event', ({ event }) => {
      this.broadcastToRace(raceId, {
        type: 'race_event',
        payload: { event }
      });
    });

    // Broadcast race lifecycle events
    ['race_started', 'race_finished', 'race_paused', 'race_reset'].forEach(eventType => {
      simulation.on(eventType, (data) => {
        this.broadcastToRace(raceId, {
          type: eventType,
          payload: data
        });
      });
    });

    // Performance updates
    simulation.on('performance_update', (data) => {
      this.broadcastToRace(raceId, {
        type: 'performance_update',
        payload: data
      });
    });
  }

  /**
   * Broadcast message to all clients in a race
   */
  broadcastToRace(raceId, message) {
    const race = this.races.get(raceId);
    if (!race) return;

    const messageStr = JSON.stringify(message);
    
    race.clients.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === 1) { // WebSocket.OPEN
        client.ws.send(messageStr);
      }
    });
  }

  /**
   * Start the server
   */
  start() {
    this.server.listen(this.port, () => {
      console.log(`
🏎️ ================================================================================
   COMPETITIVE MOBILITY SYSTEMS SIMULATOR
🏎️ ================================================================================

🚀 Server running on port ${this.port}
📊 REST API: http://localhost:${this.port}/api
📡 WebSocket: ws://localhost:${this.port}/race
🎮 Demo endpoint: POST http://localhost:${this.port}/api/demo

🏁 Ready for racing! Create a race or run a demo.
      `);
    });

    // Graceful shutdown
    process.on('SIGINT', this.shutdown.bind(this));
    process.on('SIGTERM', this.shutdown.bind(this));
  }

  /**
   * Graceful shutdown
   */
  shutdown() {
    console.log('\n🛑 Shutting down Racing Server...');
    
    // Close all WebSocket connections
    this.clients.forEach(client => {
      if (client.ws.readyState === 1) {
        client.ws.close();
      }
    });
    
    // Clear races
    this.races.clear();
    
    this.server.close(() => {
      console.log('✅ Server shutdown complete');
      process.exit(0);
    });
  }
}

// Start server when module is run directly
const server = new RacingServer({ port: 4000 });
server.start();

export { RacingServer };