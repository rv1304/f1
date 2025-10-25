/**
 * Telemetry Chart Component
 */

import React from 'react';

const TelemetryChart = ({ drivers, raceState }) => {
  // Simulate telemetry data for top 5 drivers
  const getTopDrivers = () => {
    if (!drivers) return [];
    return drivers.slice(0, 5);
  };

  const generateSpeedData = (driver, index) => {
    // Generate realistic speed data points
    const baseSpeed = 280 + (Math.random() * 40);
    const variation = 20;
    return Array.from({ length: 20 }, (_, i) => ({
      time: i,
      speed: Math.max(200, baseSpeed + (Math.sin(i * 0.5) * variation) + (Math.random() * 10 - 5))
    }));
  };

  const topDrivers = getTopDrivers();

  const driverColors = [
    '#ef4444', // Red
    '#3b82f6', // Blue  
    '#f97316', // Orange
    '#10b981', // Green
    '#8b5cf6'  // Purple
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        📈 Live Telemetry
      </h3>

      {/* Speed Chart */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-white mb-3">Speed Analysis (km/h)</h4>
        <div className="telemetry-chart p-4 h-48 relative">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 160"
            className="w-full h-full"
          >
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 40}
                x2="400"
                y2={i * 40}
                stroke="#374151"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Speed lines for each driver */}
            {topDrivers.map((driver, driverIndex) => {
              const speedData = generateSpeedData(driver, driverIndex);
              const pathData = speedData.map((point, i) => {
                const x = (i / 19) * 400;
                const y = 160 - ((point.speed - 200) / 120) * 160;
                return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
              }).join(' ');

              return (
                <path
                  key={driver.id || driverIndex}
                  d={pathData}
                  stroke={driverColors[driverIndex]}
                  strokeWidth="2"
                  fill="none"
                  opacity="0.8"
                />
              );
            })}

            {/* Y-axis labels */}
            <text x="5" y="15" fill="#9ca3af" fontSize="10">320</text>
            <text x="5" y="55" fill="#9ca3af" fontSize="10">280</text>
            <text x="5" y="95" fill="#9ca3af" fontSize="10">240</text>
            <text x="5" y="135" fill="#9ca3af" fontSize="10">200</text>
          </svg>
        </div>

        {/* Driver Legend */}
        <div className="grid grid-cols-5 gap-2 mt-3">
          {topDrivers.map((driver, index) => (
            <div
              key={driver.id || index}
              className="flex items-center space-x-2 text-xs"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: driverColors[index] }}
              />
              <span className="text-white truncate">
                {driver.name?.split(' ').pop() || `P${index + 1}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Data Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">
            {topDrivers[0]?.speed ? Math.round(topDrivers[0].speed) : '---'}
          </div>
          <div className="text-xs text-gray-400">LEADER SPEED</div>
          <div className="text-xs text-white mt-1">
            {topDrivers[0]?.name?.split(' ').pop() || 'N/A'}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-yellow-400">
            {topDrivers.length > 0 ? Math.max(...topDrivers.map(d => d.speed || 0)).toFixed(0) : '---'}
          </div>
          <div className="text-xs text-gray-400">FASTEST SPEED</div>
          <div className="text-xs text-white mt-1">km/h</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-400">
            {topDrivers.length > 0 ? (topDrivers.reduce((sum, d) => sum + (d.speed || 0), 0) / topDrivers.length).toFixed(0) : '---'}
          </div>
          <div className="text-xs text-gray-400">AVG SPEED</div>
          <div className="text-xs text-white mt-1">km/h</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-400">
            {raceState?.lap || 0}
          </div>
          <div className="text-xs text-gray-400">CURRENT LAP</div>
          <div className="text-xs text-white mt-1">
            /{raceState?.totalLaps || 0}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-lg font-bold text-red-400">
            {Math.round(Math.random() * 100)}%
          </div>
          <div className="text-xs text-gray-400">TIRE WEAR</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-lg font-bold text-orange-400">
            {Math.round(50 + Math.random() * 40)}%
          </div>
          <div className="text-xs text-gray-400">FUEL LEVEL</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-lg font-bold text-cyan-400">
            {Math.round(80 + Math.random() * 15)}°C
          </div>
          <div className="text-xs text-gray-400">ENGINE TEMP</div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryChart;