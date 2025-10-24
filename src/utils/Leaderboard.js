/**
 * VelocityForge Leaderboard System
 * 
 * Real-time leaderboard management with multiple ranking criteria
 * and performance metrics tracking.
 */

export class Leaderboard {
  constructor() {
    this.rankings = new Map();
    this.criteria = new Map();
    this.history = [];
    this.maxHistorySize = 1000;
    
    // Default ranking criteria
    this.addCriteria('position', (agent) => agent.metrics.totalDistance, 'desc');
    this.addCriteria('speed', (agent) => agent.velocity.length(), 'desc');
    this.addCriteria('efficiency', (agent) => agent.metrics.efficiency, 'desc');
    this.addCriteria('lapTime', (agent) => agent.metrics.bestLapTime, 'asc');
  }

  /**
   * Add a ranking criteria
   */
  addCriteria(name, getter, order = 'desc') {
    this.criteria.set(name, {
      getter,
      order,
      rankings: new Map()
    });
  }

  /**
   * Update leaderboard with current agent states
   */
  update(agents, currentTime) {
    const updateTime = performance.now();
    
    // Update each criteria
    for (const [criteriaName, criteria] of this.criteria) {
      this.updateCriteria(criteriaName, criteria, agents);
    }
    
    // Store historical data
    this.storeHistory(agents, currentTime, updateTime);
  }

  /**
   * Update a specific criteria ranking
   */
  updateCriteria(criteriaName, criteria, agents) {
    const rankings = [];
    
    for (const agent of agents) {
      if (!agent.isActive || !agent.isAlive) continue;
      
      const value = criteria.getter(agent);
      rankings.push({
        agentId: agent.id,
        agentName: agent.name,
        value,
        agent
      });
    }
    
    // Sort by criteria order
    rankings.sort((a, b) => {
      if (criteria.order === 'desc') {
        return b.value - a.value;
      } else {
        return a.value - b.value;
      }
    });
    
    // Update rankings map
    criteria.rankings.clear();
    rankings.forEach((ranking, index) => {
      criteria.rankings.set(ranking.agentId, {
        rank: index + 1,
        value: ranking.value,
        agent: ranking.agent
      });
    });
  }

  /**
   * Get current standings for a criteria
   */
  getStandings(criteriaName = 'position', limit = 10) {
    const criteria = this.criteria.get(criteriaName);
    if (!criteria) return [];
    
    const standings = [];
    for (const [agentId, ranking] of criteria.rankings) {
      standings.push({
        rank: ranking.rank,
        agentId,
        agentName: ranking.agent.name,
        value: ranking.value,
        agent: ranking.agent
      });
    }
    
    return standings.slice(0, limit);
  }

  /**
   * Get agent's rank for a specific criteria
   */
  getAgentRank(agentId, criteriaName = 'position') {
    const criteria = this.criteria.get(criteriaName);
    if (!criteria) return null;
    
    const ranking = criteria.rankings.get(agentId);
    return ranking ? ranking.rank : null;
  }

  /**
   * Get agent's value for a specific criteria
   */
  getAgentValue(agentId, criteriaName = 'position') {
    const criteria = this.criteria.get(criteriaName);
    if (!criteria) return null;
    
    const ranking = criteria.rankings.get(agentId);
    return ranking ? ranking.value : null;
  }

  /**
   * Get comprehensive leaderboard data
   */
  getCurrentStandings() {
    const standings = {};
    
    for (const criteriaName of this.criteria.keys()) {
      standings[criteriaName] = this.getStandings(criteriaName);
    }
    
    return standings;
  }

  /**
   * Record a lap time for an agent
   */
  recordLapTime(agentId, lapTime, position) {
    const agent = this.findAgentById(agentId);
    if (!agent) return;
    
    // Update agent's lap time metrics
    agent.metrics.lapTime = lapTime;
    if (lapTime < agent.metrics.bestLapTime) {
      agent.metrics.bestLapTime = lapTime;
    }
    
    // Emit lap complete event
    this.emitEvent('lapComplete', {
      agentId,
      agentName: agent.name,
      lapTime,
      position,
      timestamp: performance.now()
    });
  }

  /**
   * Store historical data
   */
  storeHistory(agents, currentTime, updateTime) {
    const snapshot = {
      timestamp: currentTime,
      updateTime,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        position: agent.position.toObject(),
        velocity: agent.velocity.toObject(),
        metrics: { ...agent.metrics }
      }))
    };
    
    this.history.push(snapshot);
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get historical data
   */
  getHistory(timeRange = null) {
    if (!timeRange) return this.history;
    
    const now = performance.now();
    const startTime = now - timeRange;
    
    return this.history.filter(snapshot => snapshot.updateTime >= startTime);
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const totalAgents = this.history.length > 0 ? this.history[this.history.length - 1].agents.length : 0;
    
    return {
      totalAgents,
      criteriaCount: this.criteria.size,
      historySize: this.history.length,
      lastUpdate: this.history.length > 0 ? this.history[this.history.length - 1].updateTime : 0
    };
  }

  /**
   * Find agent by ID (helper method)
   */
  findAgentById(agentId) {
    // This would need to be connected to the agent manager
    // For now, return null
    return null;
  }

  /**
   * Emit an event (placeholder)
   */
  emitEvent(eventType, data) {
    // This would be connected to the event bus
    // For now, it's a placeholder
  }

  /**
   * Clear all data
   */
  clear() {
    this.rankings.clear();
    this.history = [];
    
    for (const criteria of this.criteria.values()) {
      criteria.rankings.clear();
    }
  }

  /**
   * Export leaderboard data
   */
  export(format = 'json') {
    const data = {
      standings: this.getCurrentStandings(),
      history: this.history,
      stats: this.getStats(),
      timestamp: performance.now()
    };
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.exportToCSV(data);
      default:
        return data;
    }
  }

  /**
   * Export to CSV format
   */
  exportToCSV(data) {
    const csv = [];
    
    // Add headers
    csv.push('Agent ID,Agent Name,Position Rank,Speed Rank,Efficiency Rank,Lap Time Rank');
    
    // Add data rows
    const positionStandings = data.standings.position || [];
    const speedStandings = data.standings.speed || [];
    const efficiencyStandings = data.standings.efficiency || [];
    const lapTimeStandings = data.standings.lapTime || [];
    
    const allAgents = new Set();
    [positionStandings, speedStandings, efficiencyStandings, lapTimeStandings].forEach(standings => {
      standings.forEach(standing => allAgents.add(standing.agentId));
    });
    
    for (const agentId of allAgents) {
      const positionRank = this.getAgentRank(agentId, 'position') || 'N/A';
      const speedRank = this.getAgentRank(agentId, 'speed') || 'N/A';
      const efficiencyRank = this.getAgentRank(agentId, 'efficiency') || 'N/A';
      const lapTimeRank = this.getAgentRank(agentId, 'lapTime') || 'N/A';
      
      const agentName = positionStandings.find(s => s.agentId === agentId)?.agentName || 'Unknown';
      
      csv.push(`${agentId},${agentName},${positionRank},${speedRank},${efficiencyRank},${lapTimeRank}`);
    }
    
    return csv.join('\n');
  }
}
