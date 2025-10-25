/**
 * Race Control Panel Component
 * 
 * Controls for starting/stopping races and managing simulation
 */

import React, { useState, useEffect } from 'react';

const RaceControl = ({ isConnected, activeRace, onStartRace, onStopRace, events }) => {
  const [selectedMode, setSelectedMode] = useState('f1');
  const [selectedTrack, setSelectedTrack] = useState('monaco');
  const [isLoading, setIsLoading] = useState(false);
  const [availableModes, setAvailableModes] = useState([]);
  const [availableTracks, setAvailableTracks] = useState({});

  // Load available modes and tracks
  useEffect(() => {
    if (isConnected) {
      loadModes();
      loadTracks();
    }
  }, [isConnected]);

  const loadModes = async () => {
    try {
      const response = await fetch('/api/modes');
      const data = await response.json();
      setAvailableModes(data.modes || []);
    } catch (error) {
      console.error('Failed to load modes:', error);
    }
  };

  const loadTracks = async () => {
    try {
      const response = await fetch('/api/tracks');
      const data = await response.json();
      setAvailableTracks(data.tracks || {});
    } catch (error) {
      console.error('Failed to load tracks:', error);
    }
  };

  const handleStartRace = async () => {
    if (!isConnected || activeRace) return;
    
    setIsLoading(true);
    try {
      await onStartRace(selectedMode, selectedTrack);
    } catch (error) {
      console.error('Failed to start race:', error);
      alert('Failed to start race: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopRace = async () => {
    if (!activeRace) return;
    
    setIsLoading(true);
    try {
      await onStopRace();
    } catch (error) {
      console.error('Failed to stop race:', error);
      alert('Failed to stop race: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (event) => {
    if (!event || !event.type) return '📋';
    
    switch (event.type) {
      case 'overtake': return '🏃';
      case 'collision': return '💥';
      case 'pit_stop': return '⛽';
      case 'speed_boost': return '🚀';
      case 'weather_change': return '🌧️';
      case 'safety_car': return '🚨';
      case 'lap_complete': return '🏁';
      default: return '📋';
    }
  };

  const formatEventMessage = (event) => {
    if (!event) return 'Unknown event';
    
    const time = new Date(event.timestamp).toLocaleTimeString();
    
    switch (event.type) {
      case 'overtake':
        return `${time} - ${event.driver} overtakes position ${event.position}`;
      case 'collision':
        return `${time} - Collision involving ${event.driver}`;
      case 'pit_stop':
        return `${time} - ${event.driver} enters pit lane`;
      case 'speed_boost':
        return `${time} - ${event.driver} activates speed boost`;
      case 'weather_change':
        return `${time} - Weather changed to ${event.weather}`;
      case 'safety_car':
        return `${time} - Safety car deployed`;
      case 'lap_complete':
        return `${time} - ${event.driver} completes lap ${event.lap}`;
      default:
        return `${time} - ${event.message || 'Race event'}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Race Control Header */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          🎮 Race Control
        </h2>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          activeRace 
            ? 'bg-red-600 text-white animate-pulse' 
            : 'bg-gray-600 text-gray-300'
        }`}>
          {activeRace ? '🔴 LIVE' : '⚪ STOPPED'}
        </div>
      </div>

      {/* Race Configuration */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
        
        {/* Mode Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Racing Mode
          </label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            disabled={!isConnected || activeRace}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
          >
            {availableModes.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.name} - {mode.description}
              </option>
            ))}
          </select>
        </div>

        {/* Track Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Track
          </label>
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            disabled={!isConnected || activeRace}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
          >
            {Object.entries(availableTracks).map(([id, track]) => (
              <option key={id} value={id}>
                {track.name} - {track.location}
              </option>
            ))}
          </select>
        </div>

        {/* Control Buttons */}
        <div className="space-y-2">
          {!activeRace ? (
            <button
              onClick={handleStartRace}
              disabled={!isConnected || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 ${
                isConnected && !isLoading
                  ? 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">🏎️</span>
                  Starting Race...
                </span>
              ) : (
                '🏁 Start Race'
              )}
            </button>
          ) : (
            <button
              onClick={handleStopRace}
              disabled={!activeRace || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 ${
                activeRace && !isLoading
                  ? 'bg-red-600 hover:bg-red-700 transform hover:scale-105'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">🛑</span>
                  Stopping Race...
                </span>
              ) : (
                '🛑 Stop Race'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Live Events Feed */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Live Events</h3>
        <div className="event-feed max-h-96 overflow-y-auto space-y-2">
          {events.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <div className="text-2xl mb-2">📭</div>
              No events yet
            </div>
          ) : (
            events.map((event, index) => (
              <div
                key={index}
                className="bg-gray-600 rounded-lg p-3 border-l-4 border-red-500 race-event"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-xl">{getEventIcon(event)}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      {formatEventMessage(event)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">System Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Connection:</span>
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Active Race:</span>
            <span className={activeRace ? 'text-green-400' : 'text-gray-400'}>
              {activeRace ? `🏁 ${activeRace}` : '⚪ None'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Mode:</span>
            <span className="text-blue-400">{selectedMode.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Track:</span>
            <span className="text-yellow-400">{selectedTrack.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceControl;