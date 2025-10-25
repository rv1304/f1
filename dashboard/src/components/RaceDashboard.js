/**
 * Race Dashboard Component
 * 
 * Main F1-style dashboard showing live race data
 */

import React from 'react';
import Leaderboard from './Leaderboard';
import RaceStats from './RaceStats';
import TrackMap from './TrackMap';
import TelemetryChart from './TelemetryChart';

const RaceDashboard = ({ raceData, activeRace, isConnected }) => {
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold text-gray-400 mb-2">
            Connecting to Racing Server...
          </h2>
          <p className="text-gray-500">
            Please wait while we establish connection
          </p>
        </div>
      </div>
    );
  }

  if (!activeRace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🏁</div>
          <h2 className="text-2xl font-bold text-gray-400 mb-2">
            No Active Race
          </h2>
          <p className="text-gray-500">
            Start a race from the control panel to begin simulation
          </p>
        </div>
      </div>
    );
  }

  if (!raceData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🏎️</div>
          <h2 className="text-2xl font-bold text-gray-400 mb-2">
            Loading Race Data...
          </h2>
          <p className="text-gray-500">
            Initializing race simulation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="xl:col-span-2">
          <Leaderboard
            leaderboard={raceData.leaderboard}
            raceState={raceData.raceState}
          />
        </div>

        {/* Track Map */}
        <div className="lg:col-span-1">
          <TrackMap
            drivers={raceData.leaderboard}
            track={raceData.track}
          />
        </div>

        {/* Race Statistics */}
        <div className="lg:col-span-1">
          <RaceStats
            raceState={raceData.raceState}
            events={raceData.events}
          />
        </div>

        {/* Telemetry Charts */}
        <div className="lg:col-span-2">
          <TelemetryChart
            drivers={raceData.leaderboard}
            raceState={raceData.raceState}
          />
        </div>
      </div>
    </div>
  );
};

export default RaceDashboard;