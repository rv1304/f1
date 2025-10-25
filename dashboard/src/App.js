/**
 * VelocityForge Racing Dashboard
 * 
 * Real-time F1-style racing dashboard with live telemetry
 */

import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import RaceDashboard from './components/RaceDashboard';
import RaceControl from './components/RaceControl';
import ConnStatus from './components/ConnStatus';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [raceData, setRaceData] = useState(null);
  const [activeRace, setActiveRace] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [events, setEvents] = useState([]);
  const [connectionError, setConnectionError] = useState(null);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        console.log('🔌 Connected to VelocityForge Racing Server');
        setIsConnected(true);
        setConnectionError(null);
        setWebsocket(ws);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('🔌 Disconnected from server');
        setIsConnected(false);
        setWebsocket(null);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionError('Failed to connect to racing server');
        setIsConnected(false);
      };
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionError('Failed to establish connection');
    }
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'connection_established':
        console.log('✅ Connection established:', message.data.message);
        break;
        
      case 'race_started':
        console.log('🏁 Race started:', message.data);
        setActiveRace(message.data.raceId);
        // Subscribe to race updates
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({
            type: 'subscribe_to_race',
            raceId: message.data.raceId
          }));
        }
        break;
        
      case 'race_update':
        setRaceData(message.data);
        break;
        
      case 'race_event':
        setEvents(prev => [message.data.event, ...prev.slice(0, 19)]); // Keep last 20 events
        break;
        
      case 'race_finished':
        console.log('🏁 Race finished:', message.data);
        setActiveRace(null);
        break;
        
      case 'race_stopped':
        console.log('🛑 Race stopped:', message.data);
        setActiveRace(null);
        setRaceData(null);
        break;
        
      default:
        console.log('🔍 Unknown message type:', message.type);
    }
  };

  // Start new race
  const startRace = async (mode, track, config = {}) => {
    try {
      const response = await fetch(`${API_BASE}/api/race/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode, track, config }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('🏁 Race started successfully:', result);
        return result;
      } else {
        throw new Error(result.error || 'Failed to start race');
      }
    } catch (error) {
      console.error('❌ Failed to start race:', error);
      throw error;
    }
  };

  // Stop active race
  const stopRace = async () => {
    if (!activeRace) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/race/${activeRace}/stop`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('🛑 Race stopped successfully');
        setActiveRace(null);
        setRaceData(null);
        setEvents([]);
      } else {
        throw new Error(result.error || 'Failed to stop race');
      }
    } catch (error) {
      console.error('❌ Failed to stop race:', error);
      throw error;
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="App min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-red-600 border-b-4 border-red-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white">
              🏎️ VelocityForge Racing
            </h1>
            <div className="text-sm text-red-100">
              Real-time Multi-Agent Racing Simulator
            </div>
          </div>
          
          <ConnStatus 
            isConnected={isConnected}
            error={connectionError}
            activeRace={activeRace}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-screen">
        {/* Left Panel - Race Control */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
          <RaceControl
            isConnected={isConnected}
            activeRace={activeRace}
            onStartRace={startRace}
            onStopRace={stopRace}
            events={events}
          />
        </div>

        {/* Right Panel - Race Dashboard */}
        <div className="flex-1 bg-gray-900">
          <RaceDashboard
            raceData={raceData}
            activeRace={activeRace}
            isConnected={isConnected}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 text-center text-sm text-gray-400">
        VelocityForge Racing Simulator © 2025 | Real-time Multi-Agent Competition Platform
      </footer>
    </div>
  );
}

export default App;