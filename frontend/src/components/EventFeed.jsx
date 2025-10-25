/**
 * Event Feed Component - Live Race Commentary
 * Shows real-time race events like overtakes, collisions, pit stops
 */

import React, { useEffect, useRef } from 'react';
import { MessageSquare, Zap, AlertTriangle, Flag, Settings, Clock } from 'lucide-react';

const EventFeed = ({ events, className = '' }) => {
  const feedRef = useRef(null);

  // Auto-scroll to latest events
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0; // Scroll to top since newest events are first
    }
  }, [events]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get event icon and styling
  const getEventDisplay = (event) => {
    switch (event.type) {
      case 'overtake':
        return {
          icon: <Zap className="w-4 h-4" />,
          className: 'event-overtake',
          color: 'text-racing-yellow',
          bgColor: 'bg-yellow-900/20'
        };
      
      case 'collision':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          className: 'event-collision',
          color: 'text-racing-red',
          bgColor: 'bg-red-900/20'
        };
      
      case 'boost_used':
        return {
          icon: <Zap className="w-4 h-4" />,
          className: 'event-boost',
          color: 'text-racing-blue',
          bgColor: 'bg-blue-900/20'
        };
      
      case 'pit_stop':
      case 'pit_complete':
        return {
          icon: <Settings className="w-4 h-4" />,
          className: 'event-pit',
          color: 'text-racing-orange',
          bgColor: 'bg-orange-900/20'
        };
      
      case 'lap_complete':
        return {
          icon: <Flag className="w-4 h-4" />,
          className: 'event-lap',
          color: 'text-racing-green',
          bgColor: 'bg-green-900/20'
        };
      
      case 'agent_finished':
        return {
          icon: <Flag className="w-4 h-4" />,
          className: 'event-finish',
          color: 'text-racing-yellow',
          bgColor: 'bg-yellow-900/20'
        };
      
      case 'system':
        return {
          icon: <MessageSquare className="w-4 h-4" />,
          className: 'event-system',
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20'
        };
      
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          className: 'event-default',
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20'
        };
    }
  };

  // Generate event message
  const getEventMessage = (event) => {
    switch (event.type) {
      case 'overtake':
        if (event.overtaker && event.overtaken) {
          return `${event.overtaker.name} overtakes ${event.overtaken.name} for P${event.position}!`;
        }
        return 'Overtake occurred!';
      
      case 'collision':
        if (event.agents && event.agents.length >= 2) {
          return `Collision between ${event.agents[0].name} and ${event.agents[1].name} on lap ${event.lap}!`;
        }
        return 'Collision detected!';
      
      case 'boost_used':
        return `${event.agentId} activates boost! Fuel: ${Math.round(event.fuelRemaining)}%`;
      
      case 'pit_stop':
        return `${event.agentId} enters the pit lane`;
      
      case 'pit_complete':
        return `${event.agentId} exits pit lane with fresh fuel`;
      
      case 'lap_complete':
        const lapTimeStr = event.lapTime ? `(${(event.lapTime / 1000).toFixed(3)}s)` : '';
        const bestLapStr = event.bestLap ? ' 🏆 NEW BEST LAP!' : '';
        return `${event.agentId} completes lap ${event.lap} ${lapTimeStr}${bestLapStr}`;
      
      case 'agent_finished':
        return `🏁 ${event.agentId} finishes the race in P${event.finalPosition}! Total time: ${(event.totalTime / 1000).toFixed(3)}s`;
      
      case 'crash':
        return `💥 ${event.agentId} has crashed!`;
      
      case 'system':
        return event.message || 'System event';
      
      default:
        return event.message || `${event.type} event occurred`;
    }
  };

  // Get event priority for sorting/highlighting
  const getEventPriority = (event) => {
    switch (event.type) {
      case 'agent_finished': return 5;
      case 'collision': return 4;
      case 'overtake': return 3;
      case 'lap_complete': return event.bestLap ? 3 : 1;
      case 'boost_used': return 2;
      case 'pit_stop': return 2;
      case 'pit_complete': return 2;
      case 'crash': return 4;
      case 'system': return 1;
      default: return 1;
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className={`racing-card ${className}`}>
        <div className="racing-subheader mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          RACE EVENTS
        </div>
        <div className="text-center text-gray-400 py-8">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div>Waiting for race events...</div>
          <div className="text-sm mt-1">Start a race to see live commentary</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`racing-card ${className}`}>
      <div className="racing-subheader mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          LIVE COMMENTARY
        </div>
        <div className="text-sm text-gray-400">
          {events.length} events
        </div>
      </div>

      <div 
        ref={feedRef}
        className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide"
      >
        {events.map((event) => {
          const display = getEventDisplay(event);
          const priority = getEventPriority(event);
          const isHighPriority = priority >= 3;
          
          return (
            <div
              key={event.id || `${event.type}-${event.timestamp}`}
              className={`
                event-feed-item ${display.className}
                ${isHighPriority ? 'ring-2 ring-white/20 shadow-lg' : ''}
                ${display.bgColor}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`${display.color} mt-0.5 racing-glow`}>
                  {display.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm leading-relaxed">
                    {getEventMessage(event)}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-gray-400">
                      {formatTimestamp(event.timestamp)}
                    </div>
                    
                    {isHighPriority && (
                      <div className="text-xs font-bold uppercase tracking-wider text-racing-yellow">
                        ⭐ Highlight
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Additional event details */}
              {event.type === 'lap_complete' && event.bestLap && (
                <div className="mt-2 ml-7 text-xs text-racing-yellow bg-yellow-900/20 rounded px-2 py-1">
                  🏆 New fastest lap record!
                </div>
              )}
              
              {event.type === 'collision' && event.location && (
                <div className="mt-2 ml-7 text-xs text-gray-400">
                  📍 Location: {Math.round(event.location)}m from start
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feed controls */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <button 
          onClick={() => feedRef.current?.scrollTo(0, 0)}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          ↑ Back to top
        </button>
        
        <button 
          onClick={() => feedRef.current?.scrollTo(0, feedRef.current.scrollHeight)}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          ↓ Go to bottom
        </button>
      </div>
    </div>
  );
};

export default EventFeed;