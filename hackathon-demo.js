#!/usr/bin/env node

/**
 * VelocityForge Racing Simulator - Hackathon Demo Script
 * 
 * Complete setup and demo launcher for hackathon presentation
 */

import { spawn } from 'child_process';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
🏎️ ================================================================================
   VELOCITYFORGE RACING SIMULATOR - HACKATHON DEMO
🏎️ ================================================================================

🚀 Real-Time Multi-Agent Racing Simulation Platform
📊 Live Dashboard | 🌐 WebSocket Updates | 🏁 Multiple Racing Modes

Setting up the complete racing platform...
`);

async function startDemo() {
  console.log('📦 Installing dependencies...');
  
  // Install main dependencies
  await runCommand('npm', ['install'], 'Backend dependencies installed');
  
  // Install dashboard dependencies
  console.log('📱 Installing dashboard dependencies...');
  await runCommand('npm', ['run', 'dashboard:install'], 'Dashboard dependencies installed');
  
  // Build dashboard
  console.log('🔨 Building dashboard...');
  await runCommand('npm', ['run', 'dashboard:build'], 'Dashboard built successfully');
  
  console.log(`
✅ Setup Complete!

🏁 Starting VelocityForge Racing Server...
📊 Dashboard will be available at: http://localhost:3001
📡 WebSocket API at: ws://localhost:3001
🎮 Race Control Panel ready for hackathon demo

Starting server...
`);

  // Start the server
  const server = spawn('node', ['server/index.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  // Handle server events
  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    console.log(`\n🏁 Server stopped with code ${code}`);
    process.exit(code);
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down VelocityForge Racing Server...');
    server.kill('SIGTERM');
  });
  
  // Show demo instructions after server starts
  setTimeout(() => {
    console.log(`
🎯 ================================================================================
   HACKATHON DEMO INSTRUCTIONS
🎯 ================================================================================

1. 🌐 Open your browser to: http://localhost:3001
2. 🏎️ Select racing mode: F1, Formula E, MotoGP, Drones, Logistics, Traffic
3. 🗺️ Choose a track: Monaco, Silverstone, Spa-Francorchamps
4. 🏁 Click "Start Race" to begin live simulation
5. 📊 Watch real-time leaderboards, telemetry, and events

🏆 HACKATHON FEATURES TO SHOWCASE:
✅ Real-time multi-agent simulation
✅ Live WebSocket updates
✅ Advanced telemetry and analytics  
✅ Multiple racing modes (F1 to logistics)
✅ F1-style professional dashboard
✅ Responsive design (works on mobile)

🎮 ALTERNATIVE DEMO COMMANDS:
npm run f1:monaco:commentary  # F1 with live commentary
npm run drones               # Drone racing simulation
npm run logistics           # Supply chain optimization
npm run traffic            # Urban mobility analysis

Ready to win the hackathon! 🏆
`);
  }, 3000);
}

function runCommand(command, args, successMessage) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: true
    });
    
    let output = '';
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${successMessage}`);
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    process.on('error', reject);
  });
}

// Start the demo
startDemo().catch(error => {
  console.error('❌ Demo setup failed:', error);
  process.exit(1);
});