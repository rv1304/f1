/**
 * Race Controls Component - Control Panel for Race Management
 * Provides buttons and interfaces for starting, stopping, and configuring races
 */

import React, { useState } from 'react';
import { Play, Pause, Square, RotateCcw, Plus, Settings, Zap, Wrench } from 'lucide-react';

const RaceControls = ({ 
  raceState, 
  onStartRace, 
  onPauseRace, 
  onResetRace, 
  onCreateDemo,
  onAgentControl,
  connectionStatus,
  className = '' 
}) => {
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Handle demo creation
  const handleCreateDemo = async () => {
    setIsCreatingDemo(true);
    try {
      await onCreateDemo(6); // Create demo with 6 agents
    } finally {
      setIsCreatingDemo(false);
    }
  };

  // Handle agent control actions
  const handleAgentAction = async (action) => {
    if (!selectedAgent) return;
    
    try {
      await onAgentControl(selectedAgent.id, action);
    } catch (error) {
      console.error('Failed to control agent:', error);
    }
  };

  // Get race status display
  const getRaceStatusDisplay = () => {
    if (!raceState) return { text: 'No Race', color: 'text-gray-400' };
    
    switch (raceState.raceStatus) {
      case 'waiting':
        return { text: 'Ready to Start', color: 'text-racing-yellow' };
      case 'running':
        return { text: 'Racing', color: 'text-racing-green animate-pulse' };
      case 'paused':
        return { text: 'Paused', color: 'text-racing-orange' };
      case 'finished':
        return { text: 'Finished', color: 'text-racing-blue' };
      default:
        return { text: raceState.raceStatus, color: 'text-gray-400' };
    }
  };

  const statusDisplay = getRaceStatusDisplay();
  const canStart = raceState && raceState.raceStatus === 'waiting' && raceState.agents?.length > 0;
  const canPause = raceState && raceState.raceStatus === 'running';
  const canReset = raceState && raceState.raceStatus !== 'waiting';
  const isConnected = connectionStatus === 'connected';

  return (
    <div className={`racing-card ${className}`}>
      <div className="racing-subheader mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6" />
        RACE CONTROL CENTER
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-3 bg-black/30 rounded-lg border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Server Connection:</span>
          <div className={`
            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
            ${connectionStatus === 'connected' 
              ? 'bg-green-900/50 text-green-300 border border-green-500/50' 
              : connectionStatus === 'connecting'
              ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/50 animate-pulse'
              : 'bg-red-900/50 text-red-300 border border-red-500/50 animate-pulse'
            }
          `}>
            {connectionStatus}
          </div>
        </div>
      </div>

      {/* Race Status */}
      <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/10">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">RACE STATUS</div>
          <div className={`text-2xl font-bold ${statusDisplay.color}`}>
            {statusDisplay.text}
          </div>
          {raceState && (
            <div className="mt-2 text-sm text-gray-300">
              {raceState.agents?.length || 0} agents
              {raceState.config && (
                <span className="text-gray-500"> • {raceState.config.totalLaps} laps</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={onStartRace}
          disabled={!canStart || !isConnected}
          className="racing-button flex items-center justify-center gap-2 py-4"
        >
          <Play className="w-5 h-5" />
          START RACE
        </button>

        <button
          onClick={onPauseRace}
          disabled={!canPause || !isConnected}
          className="racing-button-secondary flex items-center justify-center gap-2 py-4"
        >
          <Pause className="w-5 h-5" />
          PAUSE
        </button>

        <button
          onClick={onResetRace}
          disabled={!canReset || !isConnected}
          className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white font-bold uppercase tracking-wider rounded-lg transition-all duration-300 hover:from-gray-700 hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          RESET
        </button>

        <button
          onClick={handleCreateDemo}
          disabled={isCreatingDemo || !isConnected}
          className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold uppercase tracking-wider rounded-lg transition-all duration-300 hover:from-purple-700 hover:to-purple-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCreatingDemo ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              CREATING...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              QUICK DEMO
            </>
          )}
        </button>
      </div>

      {/* Agent Control Section */}
      {raceState?.agents && raceState.agents.length > 0 && (
        <div className="border-t border-white/20 pt-6">
          <div className="text-sm font-bold text-racing-yellow mb-3 uppercase tracking-wide">
            Agent Controls
          </div>
          
          {/* Agent Selection */}
          <div className="mb-4">
            <select
              value={selectedAgent?.id || ''}
              onChange={(e) => {
                const agent = raceState.agents.find(a => a.id === e.target.value);
                setSelectedAgent(agent);
              }}
              className="w-full p-2 bg-black/30 border border-white/20 rounded text-white text-sm"
            >
              <option value="">Select Agent to Control</option>
              {raceState.agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} - P{(raceState.leaderboard?.indexOf(agent.id) || 0) + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Agent Action Buttons */}
          {selectedAgent && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAgentAction('boost')}
                disabled={selectedAgent.fuel < 10 || selectedAgent.status !== 'running'}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-bold uppercase rounded transition-all duration-300 hover:from-blue-700 hover:to-blue-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <Zap className="w-4 h-4" />
                BOOST
              </button>

              <button
                onClick={() => handleAgentAction('pit')}
                disabled={selectedAgent.status !== 'running'}
                className="px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-800 text-white text-sm font-bold uppercase rounded transition-all duration-300 hover:from-orange-700 hover:to-orange-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <Wrench className="w-4 h-4" />
                PIT
              </button>
            </div>
          )}

          {/* Selected Agent Info */}
          {selectedAgent && (
            <div className="mt-3 p-3 bg-black/20 rounded border border-white/10">
              <div className="text-xs text-gray-400 mb-1">SELECTED AGENT</div>
              <div className="text-sm font-bold text-white">{selectedAgent.name}</div>
              <div className="text-xs text-gray-300 mt-1">
                Status: {selectedAgent.status.toUpperCase()} • 
                Fuel: {Math.round(selectedAgent.fuel)}% • 
                Speed: {Math.round(selectedAgent.speed * 3.6)} km/h
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Demo Description */}
      {!raceState && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="text-sm text-blue-300">
            <strong>Quick Demo:</strong> Creates a race with 6 AI agents and automatically starts after 2 seconds. 
            Perfect for showcasing the simulation to judges!
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isConnected && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="text-sm text-red-300">
            <strong>⚠️ Server Disconnected:</strong> Make sure the backend server is running on port 4000.
          </div>
        </div>
      )}
    </div>
  );
};

export default RaceControls;