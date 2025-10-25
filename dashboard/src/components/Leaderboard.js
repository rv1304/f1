/**
 * Live Leaderboard Component
 * 
 * F1-style live leaderboard with driver positions
 */

import React from 'react';

const Leaderboard = ({ leaderboard, raceState }) => {
  const getPositionBadgeClass = (position) => {
    switch (position) {
      case 1: return 'bg-yellow-500 text-black';
      case 2: return 'bg-gray-400 text-black';
      case 3: return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTeamBorderClass = (team) => {
    const teamName = team?.toLowerCase().replace(/\s+/g, '');
    switch (teamName) {
      case 'redbullracing': return 'border-l-4 border-blue-600';
      case 'ferrari': return 'border-l-4 border-red-600';
      case 'mclaren': return 'border-l-4 border-orange-500';
      case 'mercedes': return 'border-l-4 border-cyan-400';
      case 'astonmartin': return 'border-l-4 border-green-500';
      case 'alpine': return 'border-l-4 border-pink-500';
      case 'williams': return 'border-l-4 border-blue-400';
      case 'alphatauri': return 'border-l-4 border-indigo-500';
      case 'alfaromeo': return 'border-l-4 border-red-500';
      case 'haas': return 'border-l-4 border-gray-500';
      default: return 'border-l-4 border-gray-500';
    }
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatSpeed = (speed) => {
    return speed ? `${Math.round(speed)} km/h` : '--- km/h';
  };

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          🏁 Leaderboard
        </h2>
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">🏎️</div>
          <p>Waiting for race data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          🏁 Live Leaderboard
        </h2>
        <div className="text-sm text-gray-400">
          {raceState && (
            <span>
              Lap {raceState.lap || 0}/{raceState.totalLaps || 0}
            </span>
          )}
        </div>
      </div>

      {/* Race Status */}
      {raceState && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Weather:</span>
              <span className="text-white">{raceState.weather || 'Clear'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Temperature:</span>
              <span className="text-white">{raceState.temperature || 25}°C</span>
            </div>
            {raceState.safetyCar && (
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400 animate-pulse">🚨 Safety Car</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 px-2 text-gray-400 text-sm font-medium">POS</th>
              <th className="text-left py-2 px-2 text-gray-400 text-sm font-medium">DRIVER</th>
              <th className="text-left py-2 px-2 text-gray-400 text-sm font-medium">TEAM</th>
              <th className="text-right py-2 px-2 text-gray-400 text-sm font-medium">TIME</th>
              <th className="text-right py-2 px-2 text-gray-400 text-sm font-medium">SPEED</th>
              <th className="text-right py-2 px-2 text-gray-400 text-sm font-medium">GAP</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((driver, index) => (
              <tr
                key={driver.id || index}
                className={`leaderboard-item hover:bg-gray-700 transition-colors ${getTeamBorderClass(driver.team)}`}
              >
                {/* Position */}
                <td className="py-3 px-2">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getPositionBadgeClass(driver.position || index + 1)}`}>
                    {driver.position || index + 1}
                  </span>
                </td>

                {/* Driver */}
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{driver.color || '🏎️'}</span>
                    <div>
                      <div className="text-white font-medium text-sm">
                        {driver.name || `Driver ${index + 1}`}
                      </div>
                      <div className="text-gray-400 text-xs">
                        #{driver.number || index + 1}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Team */}
                <td className="py-3 px-2">
                  <div className="text-gray-300 text-sm">
                    {driver.team || 'Unknown Team'}
                  </div>
                </td>

                {/* Time */}
                <td className="py-3 px-2 text-right">
                  <div className="text-white font-mono text-sm">
                    {formatTime(driver.totalTime)}
                  </div>
                  {driver.bestLap && (
                    <div className="text-green-400 text-xs">
                      Best: {formatTime(driver.bestLap)}
                    </div>
                  )}
                </td>

                {/* Speed */}
                <td className="py-3 px-2 text-right">
                  <div className="text-white font-mono text-sm">
                    {formatSpeed(driver.speed)}
                  </div>
                  {driver.acceleration && (
                    <div className={`text-xs ${driver.acceleration > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {driver.acceleration > 0 ? '↗' : '↘'} {Math.abs(driver.acceleration).toFixed(1)}
                    </div>
                  )}
                </td>

                {/* Gap */}
                <td className="py-3 px-2 text-right">
                  <div className="text-gray-300 text-sm">
                    {index === 0 ? (
                      <span className="text-yellow-400 font-bold">LEADER</span>
                    ) : (
                      <span>+{((driver.totalTime - leaderboard[0].totalTime) / 1000).toFixed(3)}s</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-700 rounded p-3">
          <div className="text-yellow-400 font-bold text-lg">
            {leaderboard[0]?.name?.split(' ').pop() || 'N/A'}
          </div>
          <div className="text-gray-400 text-xs">LEADER</div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <div className="text-green-400 font-bold text-lg">
            {Math.max(...leaderboard.map(d => d.speed || 0)).toFixed(0)}
          </div>
          <div className="text-gray-400 text-xs">TOP SPEED (km/h)</div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <div className="text-blue-400 font-bold text-lg">
            {leaderboard.length}
          </div>
          <div className="text-gray-400 text-xs">DRIVERS</div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;