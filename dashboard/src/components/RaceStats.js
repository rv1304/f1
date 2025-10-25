/**
 * Race Statistics Component
 */

import React from 'react';

const RaceStats = ({ raceState, events }) => {
  const formatTime = (time) => {
    if (!time) return '00:00';
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEventStats = () => {
    if (!events) return { total: 0, overtakes: 0, incidents: 0, pitStops: 0 };
    
    return {
      total: events.length,
      overtakes: events.filter(e => e.type === 'overtake').length,
      incidents: events.filter(e => e.type === 'collision').length,
      pitStops: events.filter(e => e.type === 'pit_stop').length
    };
  };

  const eventStats = getEventStats();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        📊 Race Statistics
      </h3>

      {/* Race Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Race Progress</span>
          <span>{raceState?.lap || 0}/{raceState?.totalLaps || 0}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${raceState?.totalLaps ? (raceState.lap / raceState.totalLaps) * 100 : 0}%` 
            }}
          />
        </div>
      </div>

      {/* Race Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">
            {formatTime(raceState?.time)}
          </div>
          <div className="text-xs text-gray-400">RACE TIME</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">
            {raceState?.lap || 0}
          </div>
          <div className="text-xs text-gray-400">CURRENT LAP</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {eventStats.overtakes}
          </div>
          <div className="text-xs text-gray-400">OVERTAKES</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {eventStats.incidents}
          </div>
          <div className="text-xs text-gray-400">INCIDENTS</div>
        </div>
      </div>

      {/* Weather & Track Conditions */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-md font-semibold text-white mb-3">Track Conditions</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Weather:</span>
            <span className="text-white">{raceState?.weather || 'Clear'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Temperature:</span>
            <span className="text-white">{raceState?.temperature || 25}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Safety Car:</span>
            <span className={raceState?.safetyCar ? 'text-yellow-400' : 'text-green-400'}>
              {raceState?.safetyCar ? 'DEPLOYED' : 'CLEAR'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceStats;