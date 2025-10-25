/**
 * Track Map Component
 */

import React from 'react';

const TrackMap = ({ drivers, track }) => {
  const getDriverPosition = (driver, index) => {
    // Simulate track positions based on progress and index
    const progress = driver.progress || (index * 5); // Percentage around track
    const angle = (progress / 100) * 2 * Math.PI;
    const radius = 80;
    const centerX = 120;
    const centerY = 120;
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return { x, y };
  };

  const getTrackInfo = () => {
    if (!track) {
      return {
        name: 'Racing Circuit',
        location: 'Unknown',
        length: '5.0 km',
        turns: 15
      };
    }
    return track;
  };

  const trackInfo = getTrackInfo();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        🗺️ Track Map
      </h3>

      {/* Track Info */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <div className="text-sm text-white font-medium">{trackInfo.name}</div>
        <div className="text-xs text-gray-400">{trackInfo.location}</div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-gray-400">Length: {trackInfo.length}</span>
          <span className="text-gray-400">Turns: {trackInfo.turns}</span>
        </div>
      </div>

      {/* Track Visualization */}
      <div className="track-minimap rounded-lg p-4 relative">
        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          className="w-full h-auto"
        >
          {/* Track outline */}
          <ellipse
            cx="120"
            cy="120"
            rx="100"
            ry="80"
            fill="none"
            stroke="#4b5563"
            strokeWidth="16"
            strokeDasharray="5,5"
          />
          
          {/* Start/Finish line */}
          <line
            x1="220"
            y1="115"
            x2="220"
            y2="125"
            stroke="#ffffff"
            strokeWidth="4"
          />
          <text
            x="225"
            y="123"
            fill="#ffffff"
            fontSize="8"
            className="text-xs"
          >
            S/F
          </text>

          {/* Sector markers */}
          <circle cx="120" cy="40" r="3" fill="#fbbf24" />
          <circle cx="40" cy="120" r="3" fill="#fbbf24" />
          <circle cx="120" cy="200" r="3" fill="#fbbf24" />

          {/* Driver positions */}
          {drivers && drivers.slice(0, 10).map((driver, index) => {
            const position = getDriverPosition(driver, index);
            const color = driver.color === '🔴' ? '#ef4444' : 
                         driver.color === '🟠' ? '#f97316' :
                         driver.color === '🔵' ? '#3b82f6' :
                         driver.color === '🟢' ? '#10b981' :
                         driver.color === '🟣' ? '#8b5cf6' : '#6b7280';
            
            return (
              <g key={driver.id || index}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r="4"
                  fill={color}
                  className="car-dot"
                />
                <text
                  x={position.x}
                  y={position.y - 8}
                  fill="#ffffff"
                  fontSize="6"
                  textAnchor="middle"
                  className="text-xs font-bold"
                >
                  {driver.position || index + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-400">Sector Markers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span className="text-gray-400">Start/Finish</span>
          </div>
        </div>
      </div>

      {/* Position Legend */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-white mb-2">Position Legend</h4>
        <div className="grid grid-cols-5 gap-1 text-xs">
          {drivers && drivers.slice(0, 10).map((driver, index) => (
            <div
              key={driver.id || index}
              className="flex items-center space-x-1 p-1 bg-gray-700 rounded"
            >
              <span className="text-white font-bold">{driver.position || index + 1}</span>
              <span className="text-gray-400 truncate">
                {driver.name?.split(' ').pop() || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackMap;