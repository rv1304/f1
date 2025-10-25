/**
 * Leaderboard Component - Live Racing Standings
 * Shows real-time position updates, lap times, and driver statistics
 */

import React from 'react';
import { Trophy, Clock, Zap, Users } from 'lucide-react';

const Leaderboard = ({ raceState, className = '' }) => {
  if (!raceState?.agents) {
    return (
      <div className={`racing-card ${className}`}>
        <div className="racing-subheader mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          LEADERBOARD
        </div>
        <div className="text-center text-gray-400 py-8">
          No race data available
        </div>
      </div>
    );
  }

  // Sort agents by current position
  const sortedAgents = [...raceState.agents].sort((a, b) => {
    // First by status (running agents first)
    if (a.status === 'finished' && b.status !== 'finished') return 1;
    if (b.status === 'finished' && a.status !== 'finished') return -1;
    
    // Then by lap (higher lap first)
    if (a.lap !== b.lap) return b.lap - a.lap;
    
    // Then by position on track (higher position first)
    return b.position - a.position;
  });

  // Format time in mm:ss.sss format
  const formatTime = (milliseconds) => {
    if (!milliseconds || milliseconds === 0) return '--:--.---';
    
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
  };

  // Format speed in km/h
  const formatSpeed = (speedMs) => {
    if (!speedMs) return '0';
    return Math.round(speedMs * 3.6); // Convert m/s to km/h
  };

  // Get position indicator style
  const getPositionStyle = (position) => {
    switch (position) {
      case 1: return 'leaderboard-position-1';
      case 2: return 'leaderboard-position-2';
      case 3: return 'leaderboard-position-3';
      default: return 'leaderboard-position-other';
    }
  };

  // Get status indicator
  const getStatusIndicator = (agent) => {
    switch (agent.status) {
      case 'running':
        return <span className="status-indicator status-running">RACING</span>;
      case 'finished':
        return <span className="status-indicator status-finished">FINISHED</span>;
      case 'crashed':
        return <span className="status-indicator status-crashed">CRASHED</span>;
      case 'pit':
        return <span className="status-indicator status-pit">PIT STOP</span>;
      default:
        return <span className="status-indicator">{agent.status.toUpperCase()}</span>;
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (agent) => {
    if (!raceState.config) return 0;
    
    const totalDistance = raceState.config.totalLaps * raceState.config.trackLength;
    const currentDistance = agent.lap * raceState.config.trackLength + agent.position;
    
    return Math.min(100, (currentDistance / totalDistance) * 100);
  };

  return (
    <div className={`racing-card ${className}`}>
      <div className="racing-subheader mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          LIVE LEADERBOARD
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {raceState.agents.length}
          </div>
          {raceState.raceStatus === 'running' && (
            <div className="flex items-center gap-1 text-green-400 animate-pulse">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              LIVE
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
        {sortedAgents.map((agent, index) => {
          const position = index + 1;
          const progressPercentage = getProgressPercentage(agent);
          
          return (
            <div
              key={agent.id}
              className="group bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all duration-300 border border-white/10 hover:border-white/30"
            >
              {/* Top row - Position, Name, Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`leaderboard-position ${getPositionStyle(position)}`}>
                    {position}
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg leading-tight">
                      {agent.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      Lap {agent.lap} / {raceState.config?.totalLaps || 0}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusIndicator(agent)}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-racing-blue to-racing-green transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {progressPercentage.toFixed(1)}% complete
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">SPEED</div>
                  <div className="font-bold text-racing-yellow">
                    {formatSpeed(agent.speed)} km/h
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">BEST LAP</div>
                  <div className="font-bold text-racing-green">
                    {formatTime(agent.bestLapTime)}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">FUEL</div>
                  <div className={`font-bold ${agent.fuel < 20 ? 'text-racing-red' : 'text-racing-blue'}`}>
                    {Math.round(agent.fuel)}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">OVERTAKES</div>
                  <div className="font-bold text-racing-orange">
                    {agent.overtakes || 0}
                  </div>
                </div>
              </div>

              {/* Additional stats for leaders */}
              {position <= 3 && agent.status !== 'crashed' && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">Total Time:</span>
                      <span className="text-white font-mono">
                        {formatTime(agent.totalTime)}
                      </span>
                    </div>
                    {agent.collisions > 0 && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-racing-red" />
                        <span className="text-gray-400">Incidents:</span>
                        <span className="text-racing-red font-bold">
                          {agent.collisions}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Race summary footer */}
      {raceState.raceStatus === 'finished' && (
        <div className="mt-6 pt-4 border-t border-racing-yellow/30">
          <div className="text-center">
            <div className="text-racing-yellow font-bold text-lg mb-2">
              🏁 RACE COMPLETED!
            </div>
            <div className="text-sm text-gray-400">
              Winner: {sortedAgents[0]?.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;