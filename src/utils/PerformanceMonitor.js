/**
 * VelocityForge Performance Monitor
 * 
 * Real-time performance monitoring and optimization for the simulation engine.
 */

export class PerformanceMonitor {
  constructor() {
    this.isRunning = false;
    this.startTime = 0;
    this.lastUpdateTime = 0;
    
    // Performance metrics
    this.metrics = {
      totalFrames: 0,
      averageFPS: 0,
      minFPS: Infinity,
      maxFPS: 0,
      averageFrameTime: 0,
      minFrameTime: Infinity,
      maxFrameTime: 0,
      
      // System-specific metrics
      physicsUpdateTime: 0,
      agentUpdateTime: 0,
      eventProcessingTime: 0,
      collisionDetectionTime: 0,
      
      // Memory usage
      memoryUsage: 0,
      peakMemoryUsage: 0,
      
      // Performance warnings
      warnings: []
    };
    
    // Rolling averages
    this.rollingAverages = {
      frameTime: [],
      physicsTime: [],
      agentTime: [],
      eventTime: [],
      collisionTime: []
    };
    
    this.maxRollingSamples = 60; // 1 second at 60 FPS
  }

  /**
   * Start performance monitoring
   */
  start() {
    this.isRunning = true;
    this.startTime = performance.now();
    this.lastUpdateTime = this.startTime;
    
    console.log('📊 Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stop() {
    this.isRunning = false;
    console.log('📊 Performance monitoring stopped');
  }

  /**
   * Record a frame update
   */
  recordFrame() {
    if (!this.isRunning) return;
    
    const now = performance.now();
    const frameTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    
    // Update frame metrics
    this.metrics.totalFrames++;
    this.updateRollingAverage('frameTime', frameTime);
    
    // Calculate FPS
    const fps = 1000 / frameTime;
    this.metrics.averageFPS = this.calculateRollingAverage('frameTime', 1000);
    this.metrics.minFPS = Math.min(this.metrics.minFPS, fps);
    this.metrics.maxFPS = Math.max(this.metrics.maxFPS, fps);
    
    // Update frame time metrics
    this.metrics.averageFrameTime = this.calculateRollingAverage('frameTime');
    this.metrics.minFrameTime = Math.min(this.metrics.minFrameTime, frameTime);
    this.metrics.maxFrameTime = Math.max(this.metrics.maxFrameTime, frameTime);
    
    // Check for performance warnings
    this.checkPerformanceWarnings(frameTime);
  }

  /**
   * Record physics update time
   */
  recordPhysicsUpdate(time) {
    this.updateRollingAverage('physicsTime', time);
    this.metrics.physicsUpdateTime = this.calculateRollingAverage('physicsTime');
  }

  /**
   * Record agent update time
   */
  recordAgentUpdate(time) {
    this.updateRollingAverage('agentTime', time);
    this.metrics.agentUpdateTime = this.calculateRollingAverage('agentTime');
  }

  /**
   * Record event processing time
   */
  recordEventProcessing(time) {
    this.updateRollingAverage('eventTime', time);
    this.metrics.eventProcessingTime = this.calculateRollingAverage('eventTime');
  }

  /**
   * Record collision detection time
   */
  recordCollisionDetection(time) {
    this.updateRollingAverage('collisionTime', time);
    this.metrics.collisionDetectionTime = this.calculateRollingAverage('collisionTime');
  }

  /**
   * Update rolling average for a metric
   */
  updateRollingAverage(metric, value) {
    const samples = this.rollingAverages[metric];
    samples.push(value);
    
    if (samples.length > this.maxRollingSamples) {
      samples.shift();
    }
  }

  /**
   * Calculate rolling average for a metric
   */
  calculateRollingAverage(metric, multiplier = 1) {
    const samples = this.rollingAverages[metric];
    if (samples.length === 0) return 0;
    
    const sum = samples.reduce((acc, val) => acc + val, 0);
    return (sum / samples.length) * multiplier;
  }

  /**
   * Check for performance warnings
   */
  checkPerformanceWarnings(frameTime) {
    const warnings = this.metrics.warnings;
    
    // Clear old warnings
    this.metrics.warnings = warnings.filter(warning => 
      performance.now() - warning.timestamp < 5000 // Keep warnings for 5 seconds
    );
    
    // Check for low FPS
    if (this.metrics.averageFPS < 30) {
      this.addWarning('low_fps', `Low FPS detected: ${this.metrics.averageFPS.toFixed(1)} FPS`);
    }
    
    // Check for high frame time
    if (frameTime > 33.33) { // More than 30 FPS
      this.addWarning('high_frame_time', `High frame time: ${frameTime.toFixed(2)}ms`);
    }
    
    // Check for physics performance
    if (this.metrics.physicsUpdateTime > 16.67) { // More than 60 FPS worth
      this.addWarning('physics_slow', `Physics update slow: ${this.metrics.physicsUpdateTime.toFixed(2)}ms`);
    }
    
    // Check for agent update performance
    if (this.metrics.agentUpdateTime > 16.67) {
      this.addWarning('agent_slow', `Agent update slow: ${this.metrics.agentUpdateTime.toFixed(2)}ms`);
    }
  }

  /**
   * Add a performance warning
   */
  addWarning(type, message) {
    const warning = {
      type,
      message,
      timestamp: performance.now()
    };
    
    // Avoid duplicate warnings
    const existingWarning = this.metrics.warnings.find(w => 
      w.type === type && performance.now() - w.timestamp < 1000
    );
    
    if (!existingWarning) {
      this.metrics.warnings.push(warning);
      console.warn(`⚠️ Performance warning: ${message}`);
    }
  }

  /**
   * Get current performance statistics
   */
  getStats() {
    const now = performance.now();
    const runtime = now - this.startTime;
    
    return {
      ...this.metrics,
      runtime,
      uptime: this.isRunning ? runtime : 0,
      warnings: this.metrics.warnings.length
    };
  }

  /**
   * Get performance report
   */
  getReport() {
    const stats = this.getStats();
    
    return {
      summary: {
        averageFPS: stats.averageFPS.toFixed(1),
        minFPS: stats.minFPS === Infinity ? 'N/A' : stats.minFPS.toFixed(1),
        maxFPS: stats.maxFPS.toFixed(1),
        averageFrameTime: stats.averageFrameTime.toFixed(2) + 'ms',
        totalFrames: stats.totalFrames,
        runtime: (stats.runtime / 1000).toFixed(1) + 's'
      },
      breakdown: {
        physics: stats.physicsUpdateTime.toFixed(2) + 'ms',
        agents: stats.agentUpdateTime.toFixed(2) + 'ms',
        events: stats.eventProcessingTime.toFixed(2) + 'ms',
        collisions: stats.collisionDetectionTime.toFixed(2) + 'ms'
      },
      warnings: stats.warnings.map(w => ({
        type: w.type,
        message: w.message,
        age: ((performance.now() - w.timestamp) / 1000).toFixed(1) + 's ago'
      }))
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      totalFrames: 0,
      averageFPS: 0,
      minFPS: Infinity,
      maxFPS: 0,
      averageFrameTime: 0,
      minFrameTime: Infinity,
      maxFrameTime: 0,
      physicsUpdateTime: 0,
      agentUpdateTime: 0,
      eventProcessingTime: 0,
      collisionDetectionTime: 0,
      memoryUsage: 0,
      peakMemoryUsage: 0,
      warnings: []
    };
    
    // Clear rolling averages
    for (const metric in this.rollingAverages) {
      this.rollingAverages[metric] = [];
    }
    
    this.startTime = performance.now();
    this.lastUpdateTime = this.startTime;
  }

  /**
   * Export performance data
   */
  export(format = 'json') {
    const data = {
      stats: this.getStats(),
      report: this.getReport(),
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
    csv.push('Metric,Value,Unit');
    
    // Add summary data
    csv.push(`Average FPS,${data.report.summary.averageFPS},fps`);
    csv.push(`Min FPS,${data.report.summary.minFPS},fps`);
    csv.push(`Max FPS,${data.report.summary.maxFPS},fps`);
    csv.push(`Average Frame Time,${data.report.summary.averageFrameTime},ms`);
    csv.push(`Total Frames,${data.report.summary.totalFrames},frames`);
    csv.push(`Runtime,${data.report.summary.runtime},seconds`);
    
    // Add breakdown data
    csv.push(`Physics Update,${data.report.breakdown.physics},ms`);
    csv.push(`Agent Update,${data.report.breakdown.agents},ms`);
    csv.push(`Event Processing,${data.report.breakdown.events},ms`);
    csv.push(`Collision Detection,${data.report.breakdown.collisions},ms`);
    
    return csv.join('\n');
  }
}
