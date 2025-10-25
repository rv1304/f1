/**
 * Custom React Hook for WebSocket Race Connection
 * Handles real-time communication with the racing simulation server
 */

import { useEffect, useState, useRef, useCallback } from 'react';

export function useRaceWebSocket(raceId, token = null) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [raceState, setRaceState] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // WebSocket connection management
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      // For development, use hardcoded WebSocket URL
      const wsUrl = 'ws://localhost:4000/race';
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setConnectionStatus('connected');
        setError(null);
        reconnectAttempts.current = 0;

        // Join race if raceId is provided
        if (raceId) {
          wsRef.current.send(JSON.stringify({
            type: 'join_race',
            payload: { raceId, token }
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Attempt reconnection if not a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setError('Connection error');
        setConnectionStatus('disconnected');
      };

    } catch (err) {
      console.error('❌ Failed to create WebSocket connection:', err);
      setError('Failed to connect');
      setConnectionStatus('disconnected');
    }
  }, [raceId, token]);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((message) => {
    const { type, payload } = message;

    switch (type) {
      case 'connection_established':
        console.log('🎉 WebSocket connection established');
        break;

      case 'race_joined':
        console.log('🏁 Joined race:', payload.raceId);
        if (payload.state) {
          setRaceState(payload.state);
        }
        break;

      case 'race_state':
        if (payload.state) {
          setRaceState(payload.state);
        }
        break;

      case 'race_event':
        if (payload.event) {
          setEvents(prev => [payload.event, ...prev.slice(0, 199)]); // Keep last 200 events
        }
        break;

      case 'race_started':
        console.log('🚀 Race started!');
        addSystemEvent('Race started!', 'success');
        break;

      case 'race_finished':
        console.log('🏁 Race finished!');
        addSystemEvent('Race finished!', 'success');
        break;

      case 'race_paused':
        console.log('⏸️ Race paused');
        addSystemEvent(`Race ${payload.status}`, 'info');
        break;

      case 'race_reset':
        console.log('🔄 Race reset');
        setEvents([]);
        addSystemEvent('Race reset', 'info');
        break;

      case 'error':
        console.error('❌ Server error:', payload.message);
        setError(payload.message);
        break;

      case 'performance_update':
        // Handle performance metrics if needed
        break;

      case 'chat':
        addSystemEvent(`Chat: ${payload.message}`, 'info');
        break;

      default:
        console.warn('⚠️ Unknown message type:', type);
    }
  }, []);

  // Add system event to the event feed
  const addSystemEvent = useCallback((message, level = 'info') => {
    const event = {
      id: Date.now() + Math.random(),
      type: 'system',
      timestamp: new Date().toISOString(),
      message,
      level
    };
    setEvents(prev => [event, ...prev.slice(0, 199)]);
  }, []);

  // Send control command
  const sendControl = useCallback((action, agentId, params = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'control',
        payload: { action, agentId, params }
      }));
      return true;
    }
    return false;
  }, []);

  // Send chat message
  const sendChat = useCallback((message, level = 'info') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        payload: { message, level }
      }));
      return true;
    }
    return false;
  }, []);

  // Request current race state
  const requestRaceState = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && raceId) {
      wsRef.current.send(JSON.stringify({
        type: 'get_race_state',
        payload: { raceId }
      }));
      return true;
    }
    return false;
  }, [raceId]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    reconnectAttempts.current = maxReconnectAttempts; // Prevent auto-reconnect
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setConnectionStatus('disconnected');
  }, []);

  // Setup connection on mount and when raceId changes
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Periodic ping to keep connection alive
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ping',
          payload: { timestamp: Date.now() }
        }));
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, []);

  return {
    connectionStatus,
    raceState,
    events,
    error,
    sendControl,
    sendChat,
    requestRaceState,
    connect,
    disconnect
  };
}