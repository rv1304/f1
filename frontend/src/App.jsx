/**
 * Competitive Mobility Systems Simulator - Main App Component
 * Real-time multi-agent racing simulation dashboard
 * 
 * Features:
 * - Live track visualization
 * - Real-time leaderboards
 * - Event feed commentary
 * - Race control panel
 * - WebSocket real-time updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Wifi, WifiOff, Settings, Trophy, MessageSquare, Map } from 'lucide-react';

// Components
import TrackCanvas from './components/TrackCanvas.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import EventFeed from './components/EventFeed.jsx';
import RaceControls from './components/RaceControls.jsx';

// Hooks
import { useRaceWebSocket } from './hooks/useRaceWebSocket.js';

const App = () => {
  const [currentRaceId, setCurrentRaceId] = useState(null);
  const [selectedView, setSelectedView] = useState('track'); // track, leaderboard, events, controls
  
  // WebSocket connection
  const {
    connectionStatus,
    raceState,
    events,
    error,
    sendControl,
    sendChat,
    requestRaceState
  } = useRaceWebSocket(currentRaceId);

  // API helper function
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }, []);

  // Race control functions
  const handleStartRace = useCallback(async () => {
    if (!currentRaceId) return;
    
    try {
      await apiCall(`/races/${currentRaceId}/control`, {
        method: 'POST',
        body: JSON.stringify({ action: 'start' })
      });
    } catch (error) {
      console.error('Failed to start race:', error);
    }
  }, [currentRaceId, apiCall]);

  const handlePauseRace = useCallback(async () => {
    if (!currentRaceId) return;
    
    try {
      await apiCall(`/races/${currentRaceId}/control`, {
        method: 'POST',
        body: JSON.stringify({ action: 'pause' })
      });
    } catch (error) {
      console.error('Failed to pause race:', error);
    }
  }, [currentRaceId, apiCall]);

  const handleResetRace = useCallback(async () => {
    if (!currentRaceId) return;
    
    try {
      await apiCall(`/races/${currentRaceId}/control`, {
        method: 'POST',
        body: JSON.stringify({ action: 'reset' })
      });
    } catch (error) {
      console.error('Failed to reset race:', error);
    }
  }, [currentRaceId, apiCall]);

  const handleCreateDemo = useCallback(async (agentCount = 6) => {
    try {
      const result = await apiCall('/demo', {
        method: 'POST',
        body: JSON.stringify({ agentCount })
      });
      
      setCurrentRaceId(result.raceId);
      
      // Send notification
      sendChat(`Demo race created with ${result.agentCount} agents!`, 'success');
      
    } catch (error) {
      console.error('Failed to create demo:', error);
    }
  }, [apiCall, sendChat]);

  const handleAgentControl = useCallback(async (agentId, action, params = {}) => {
    if (!currentRaceId) return;
    
    try {
      await apiCall(`/races/${currentRaceId}/agents/${agentId}/control`, {
        method: 'POST',
        body: JSON.stringify({ action, params })
      });
    } catch (error) {
      console.error('Failed to control agent:', error);
    }
  }, [currentRaceId, apiCall]);

  // Auto-create demo on startup if no race exists
  useEffect(() => {
    if (connectionStatus === 'connected' && !currentRaceId) {
      // Small delay to ensure WebSocket is fully ready
      const timer = setTimeout(() => {
        handleCreateDemo(6);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, currentRaceId, handleCreateDemo]);

  // Connection status indicator
  const ConnectionIndicator = () => (
    <div className={`connection-indicator ${
      connectionStatus === 'connected' ? 'connection-connected' :
      connectionStatus === 'connecting' ? 'connection-connecting' :
      'connection-disconnected'
    }`}>
      {connectionStatus === 'connected' ? (
        <>
          <Wifi className="w-4 h-4 inline mr-1" />
          Connected
        </>
      ) : connectionStatus === 'connecting' ? (
        <>
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin inline mr-1"></div>
          Connecting...
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 inline mr-1" />
          Disconnected
        </>
      )}
    </div>
  );

  // Mobile view selector
  const ViewSelector = () => (
    <div className="lg:hidden bg-black/30 backdrop-blur-sm border-b border-white/20 p-4">
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'track', label: 'Track', icon: Map },
          { id: 'leaderboard', label: 'Standings', icon: Trophy },
          { id: 'events', label: 'Events', icon: MessageSquare },
          { id: 'controls', label: 'Controls', icon: Settings }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedView(id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
              ${selectedView === id 
                ? 'bg-racing-red text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ConnectionIndicator />
      
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-racing-red/30 shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="racing-header text-4xl lg:text-6xl mb-2">
                COMPETITIVE MOBILITY SIMULATOR
              </h1>
              <p className="text-gray-300 text-lg">
                Real-Time Multi-Agent Racing Platform
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-4 text-right">
              <div className="text-sm text-gray-400">
                <div>Hackathon Edition</div>
                <div className="text-racing-yellow">v1.0.0</div>
              </div>
              <Flag className="w-8 h-8 text-racing-red racing-glow" />
            </div>
          </div>
        </div>
      </header>

      <ViewSelector />

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-6">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 h-[calc(100vh-200px)]">
          {/* Left Column - Track and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Track Visualization */}
            <div className="racing-card h-2/3">
              <div className="racing-subheader mb-4 flex items-center gap-2">
                <Map className="w-6 h-6" />
                LIVE TRACK VIEW
              </div>
              <TrackCanvas 
                raceState={raceState} 
                className="h-full"
              />
            </div>
            
            {/* Race Controls */}
            <div className="h-1/3">
              <RaceControls
                raceState={raceState}
                onStartRace={handleStartRace}
                onPauseRace={handlePauseRace}
                onResetRace={handleResetRace}
                onCreateDemo={handleCreateDemo}
                onAgentControl={handleAgentControl}
                connectionStatus={connectionStatus}
                className="h-full"
              />
            </div>
          </div>

          {/* Right Column - Leaderboard and Events */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="h-1/2">
              <Leaderboard 
                raceState={raceState} 
                className="h-full"
              />
            </div>
            
            {/* Event Feed */}
            <div className="h-1/2">
              <EventFeed 
                events={events} 
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {selectedView === 'track' && (
            <div className="racing-card">
              <div className="racing-subheader mb-4 flex items-center gap-2">
                <Map className="w-6 h-6" />
                LIVE TRACK VIEW
              </div>
              <div className="h-80">
                <TrackCanvas 
                  raceState={raceState} 
                  className="h-full"
                />
              </div>
            </div>
          )}
          
          {selectedView === 'leaderboard' && (
            <Leaderboard raceState={raceState} />
          )}
          
          {selectedView === 'events' && (
            <EventFeed events={events} />
          )}
          
          {selectedView === 'controls' && (
            <RaceControls
              raceState={raceState}
              onStartRace={handleStartRace}
              onPauseRace={handlePauseRace}
              onResetRace={handleResetRace}
              onCreateDemo={handleCreateDemo}
              onAgentControl={handleAgentControl}
              connectionStatus={connectionStatus}
            />
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 left-4 right-4 lg:right-auto lg:w-96 bg-red-900/90 border border-red-500/50 rounded-lg p-4 text-red-200">
            <div className="font-bold mb-1">Connection Error</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {/* Race Status Footer */}
        {raceState && (
          <div className="mt-8 p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-gray-400">Race ID:</span>
                  <span className="ml-2 font-mono text-racing-yellow">
                    {currentRaceId?.slice(-8)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Agents:</span>
                  <span className="ml-2 text-white font-bold">
                    {raceState.agents?.length || 0}
                  </span>
                </div>
                {raceState.config && (
                  <>
                    <div>
                      <span className="text-gray-400">Track:</span>
                      <span className="ml-2 text-white">
                        {raceState.config.trackLength}m
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Laps:</span>
                      <span className="ml-2 text-white">
                        {raceState.config.totalLaps}
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-gray-400 text-xs">
                  Powered by VelocityForge Engine
                </div>
                <div className="text-racing-yellow font-bold">
                  Real-Time Racing Simulation
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;