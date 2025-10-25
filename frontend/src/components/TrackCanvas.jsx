/**
 * Track Canvas Component - Real-time Racing Visualization
 * Renders agents moving around a track with live position updates
 */

import React, { useRef, useEffect, useState } from 'react';

const TrackCanvas = ({ raceState, className = '' }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Track configuration
  const trackConfig = {
    centerX: 400,
    centerY: 300,
    radiusX: 350,
    radiusY: 250,
    trackWidth: 40, // Reduced from 60 to prevent negative radii
    startLineAngle: -Math.PI / 2 // Top of the track
  };

  // Agent colors for different positions
  const agentColors = [
    '#FFD700', // Gold - 1st place
    '#C0C0C0', // Silver - 2nd place  
    '#CD7F32', // Bronze - 3rd place
    '#FF4444', // Red
    '#4444FF', // Blue
    '#44FF44', // Green
    '#FF44FF', // Magenta
    '#FFFF44', // Yellow
    '#44FFFF', // Cyan
    '#FF8844', // Orange
    '#8844FF', // Purple
    '#44FF88', // Lime
    '#FF4488', // Pink
    '#88FF44', // Light Green
    '#4488FF', // Light Blue
    '#FF8888', // Light Red
    '#8888FF', // Light Purple
    '#88FF88', // Light Green 2
    '#FFFF88', // Light Yellow
    '#FF88FF'  // Light Magenta
  ];

  // Resize canvas to fit container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();
      
      const width = Math.min(rect.width, 1200);
      const height = Math.min(rect.height, width * 0.75); // 4:3 aspect ratio
      
      setCanvasSize({ width, height });
      
      // Update canvas size and scale
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Update track config for new size with minimum safe values
      trackConfig.centerX = width / 2;
      trackConfig.centerY = height / 2;
      trackConfig.radiusX = Math.max(Math.min(width * 0.4, height * 0.4), 100);
      trackConfig.radiusY = Math.max(Math.min(width * 0.3, height * 0.3), 80);
      trackConfig.trackWidth = Math.min(40, Math.min(trackConfig.radiusX, trackConfig.radiusY) * 0.6);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Convert track position (0-1) to canvas coordinates
  const positionToCoordinates = (position, lap, trackLength) => {
    // Normalize position to 0-1 range around the track
    const normalizedPosition = (position % trackLength) / trackLength;
    
    // Calculate angle around the elliptical track
    const angle = trackConfig.startLineAngle + (normalizedPosition * 2 * Math.PI);
    
    // Calculate elliptical coordinates
    const x = trackConfig.centerX + Math.cos(angle) * trackConfig.radiusX;
    const y = trackConfig.centerY + Math.sin(angle) * trackConfig.radiusY;
    
    return { x, y, angle, normalizedPosition };
  };

  // Draw the racing track
  const drawTrack = (ctx) => {
    const { centerX, centerY, radiusX, radiusY, trackWidth } = trackConfig;
    
    // Ensure we don't get negative radii
    const safeTrackWidth = Math.min(trackWidth, Math.min(radiusX, radiusY) * 0.8);
    const innerRadiusX = Math.max(radiusX - safeTrackWidth/2, 10);
    const innerRadiusY = Math.max(radiusY - safeTrackWidth/2, 10);
    const outerRadiusX = radiusX + safeTrackWidth/2;
    const outerRadiusY = radiusY + safeTrackWidth/2;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw grass background
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw outer track boundary
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, outerRadiusX, outerRadiusY, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#404040';
    ctx.fill();
    
    // Draw inner track (grass)
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, innerRadiusX, innerRadiusY, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#228B22';
    ctx.fill();
    
    // Draw actual racing surface
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, outerRadiusX, outerRadiusY, 0, 0, 2 * Math.PI);
    ctx.clip();
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, innerRadiusX, innerRadiusY, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#2D2D2D';
    ctx.fill();
    
    // Reset clipping
    ctx.restore();
    ctx.save();
    
    // Draw track markings (dashed center line)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw start/finish line
    const startX = centerX + Math.cos(trackConfig.startLineAngle) * radiusX;
    const startY = centerY + Math.sin(trackConfig.startLineAngle) * radiusY;
    const lineLength = trackWidth;
    const lineAngle = trackConfig.startLineAngle + Math.PI / 2;
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(
      startX - Math.cos(lineAngle) * lineLength / 2,
      startY - Math.sin(lineAngle) * lineLength / 2
    );
    ctx.lineTo(
      startX + Math.cos(lineAngle) * lineLength / 2,
      startY + Math.sin(lineAngle) * lineLength / 2
    );
    ctx.stroke();
    
    // Draw checkered pattern on start line
    const checkerSize = 8;
    for (let i = -3; i <= 3; i++) {
      for (let j = 0; j < 2; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillStyle = '#000000';
        } else {
          ctx.fillStyle = '#FFFFFF';
        }
        
        const checkerX = startX + Math.cos(lineAngle) * (i * checkerSize) - checkerSize/2;
        const checkerY = startY + Math.sin(lineAngle) * (i * checkerSize) - checkerSize/2;
        
        ctx.fillRect(checkerX, checkerY, checkerSize, checkerSize);
      }
    }
  };

  // Draw racing agents
  const drawAgents = (ctx) => {
    if (!raceState?.agents) return;
    
    const { config } = raceState;
    const trackLength = config?.trackLength || 5000;
    
    // Sort agents by position for drawing order (back to front)
    const sortedAgents = [...raceState.agents].sort((a, b) => {
      if (a.lap !== b.lap) return a.lap - b.lap;
      return a.position - b.position;
    });
    
    sortedAgents.forEach((agent, index) => {
      const coords = positionToCoordinates(agent.position, agent.lap, trackLength);
      const colorIndex = (raceState.leaderboard?.indexOf(agent.id) || index) % agentColors.length;
      const agentColor = agentColors[colorIndex];
      
      // Agent body
      ctx.fillStyle = agentColor;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Direction indicator
      const directionLength = 12;
      const directionX = coords.x + Math.cos(coords.angle + Math.PI/2) * directionLength;
      const directionY = coords.y + Math.sin(coords.angle + Math.PI/2) * directionLength;
      
      ctx.strokeStyle = agentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(directionX, directionY);
      ctx.stroke();
      
      // Speed indicator (glow effect)
      const speedRatio = agent.speed / (agent.maxSpeed || 60);
      if (speedRatio > 0.8) {
        ctx.shadowColor = agentColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 12, 0, 2 * Math.PI);
        ctx.fillStyle = agentColor + '40'; // Semi-transparent
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      // Agent name label
      if (agent.name) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name, coords.x, coords.y - 20);
        
        // Position number
        const position = (raceState.leaderboard?.indexOf(agent.id) || 0) + 1;
        ctx.fillStyle = agentColor;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`P${position}`, coords.x, coords.y + 25);
      }
      
      // Boost/special effects
      if (agent.status === 'pit') {
        // Pit stop indicator
        ctx.fillStyle = '#FF6600';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PIT', coords.x, coords.y + 40);
      } else if (agent.status === 'crashed') {
        // Crash indicator
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('💥', coords.x, coords.y + 40);
      }
    });
  };

  // Draw race information overlay
  const drawRaceInfo = (ctx) => {
    if (!raceState) return;
    
    // Race status
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 200, 120);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('RACE STATUS', 20, 30);
    
    ctx.font = '12px monospace';
    ctx.fillText(`Status: ${raceState.raceStatus.toUpperCase()}`, 20, 50);
    ctx.fillText(`Agents: ${raceState.agents?.length || 0}`, 20, 70);
    
    if (raceState.config) {
      ctx.fillText(`Laps: ${raceState.config.totalLaps}`, 20, 90);
      ctx.fillText(`Track: ${raceState.config.trackLength}m`, 20, 110);
    }
    
    // Performance info
    if (raceState.raceTime) {
      const raceTimeSeconds = Math.floor(raceState.raceTime / 1000);
      const minutes = Math.floor(raceTimeSeconds / 60);
      const seconds = raceTimeSeconds % 60;
      ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, 20, 130);
    }
  };

  // Main render function
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.save();
    
    drawTrack(ctx);
    drawAgents(ctx);
    drawRaceInfo(ctx);
    
    ctx.restore();
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [raceState, canvasSize]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="track-canvas w-full h-full rounded-lg border-2 border-white/30"
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
      
      {/* Track legend */}
      <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg p-3 text-sm">
        <div className="text-racing-yellow font-bold mb-2">TRACK LEGEND</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span>1st Place</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span>2nd Place</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          <span>3rd Place</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-white"></div>
          <span>Start/Finish</span>
        </div>
      </div>
    </div>
  );
};

export default TrackCanvas;