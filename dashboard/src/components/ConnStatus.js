/**
 * Connection Status Component
 */

import React from 'react';

const ConnStatus = ({ isConnected, error, activeRace }) => {
  const getStatusColor = () => {
    if (error) return 'text-red-400';
    if (!isConnected) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusIcon = () => {
    if (error) return '❌';
    if (!isConnected) return '🔄';
    return '✅';
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (!isConnected) return 'Connecting...';
    return 'Connected';
  };

  return (
    <div className="flex items-center space-x-4">
      <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
        <span>{getStatusIcon()}</span>
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {activeRace && (
        <div className="flex items-center space-x-2 text-red-400">
          <span className="animate-pulse">🔴</span>
          <span className="text-sm font-medium">LIVE RACE</span>
        </div>
      )}
    </div>
  );
};

export default ConnStatus;