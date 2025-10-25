/**
 * Blockchain Integration Service
 * Handles interaction with Polygon Amoy testnet for race result anchoring
 */

import { ethers } from 'ethers';

// Contract ABI (simplified for demo)
const RACE_RESULTS_ABI = [
  "function createRace(string memory _raceId, string memory _raceName, uint256 _trackLength, uint256 _totalLaps) external returns (bytes32)",
  "function submitResult(bytes32 raceHash, address participant, uint256 finalPosition, uint256 bestLapTime, uint256 totalTime, uint256 overtakes, string memory agentName) external",
  "function completeRace(bytes32 raceHash) external",
  "function getRace(bytes32 raceHash) external view returns (tuple(string raceId, string raceName, uint256 trackLength, uint256 totalLaps, uint256 startTime, uint256 endTime, address organizer, bool completed, uint256 resultCount))",
  "function getRaceResults(bytes32 raceHash) external view returns (tuple(address participant, uint256 finalPosition, uint256 bestLapTime, uint256 totalTime, uint256 overtakes, uint256 timestamp, string agentName, bool verified)[])",
  "function getLeaderboard(bytes32 raceHash) external view returns (tuple(address participant, uint256 finalPosition, uint256 bestLapTime, uint256 totalTime, uint256 overtakes, uint256 timestamp, string agentName, bool verified)[])"
];

export class BlockchainService {
  constructor(config = {}) {
    // Polygon Amoy Testnet configuration
    this.networkConfig = {
      chainId: 80002, // Polygon Amoy testnet
      name: 'Polygon Amoy',
      rpcUrl: config.rpcUrl || 'https://rpc-amoy.polygon.technology',
      explorerUrl: 'https://amoy.polygonscan.com'
    };
    
    // Contract deployment address (would be set after deployment)
    this.contractAddress = config.contractAddress || null;
    
    // Private key for transactions (in production, use secure key management)
    this.privateKey = config.privateKey || process.env.BLOCKCHAIN_PRIVATE_KEY;
    
    this.provider = null;
    this.signer = null;
    this.contract = null;
    
    this.initialize();
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Setup provider
      this.provider = new ethers.JsonRpcProvider(this.networkConfig.rpcUrl);
      
      // Setup signer (for transactions)
      if (this.privateKey) {
        this.signer = new ethers.Wallet(this.privateKey, this.provider);
        console.log('🔗 Blockchain service initialized with wallet:', this.signer.address);
      } else {
        console.warn('⚠️ No private key provided - read-only mode');
      }
      
      // Setup contract instance
      if (this.contractAddress) {
        this.contract = new ethers.Contract(
          this.contractAddress,
          RACE_RESULTS_ABI,
          this.signer || this.provider
        );
        console.log('📜 Contract connected at:', this.contractAddress);
      } else {
        console.warn('⚠️ No contract address provided - contract methods disabled');
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
    }
  }

  /**
   * Check if blockchain service is ready for transactions
   */
  isReady() {
    return !!(this.provider && this.signer && this.contract);
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    if (!this.provider) return null;
    
    try {
      const network = await this.provider.getNetwork();
      const gasPrice = await this.provider.getFeeData();
      
      return {
        chainId: Number(network.chainId),
        name: network.name,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
        explorerUrl: this.networkConfig.explorerUrl
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance() {
    if (!this.signer) return null;
    
    try {
      const balance = await this.provider.getBalance(this.signer.address);
      return {
        address: this.signer.address,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString()
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  }

  /**
   * Create a new race on-chain
   */
  async createRace(raceData) {
    if (!this.isReady()) {
      throw new Error('Blockchain service not ready');
    }

    try {
      const { raceId, name, trackLength, totalLaps } = raceData;
      
      console.log('📝 Creating race on blockchain:', { raceId, name, trackLength, totalLaps });
      
      const tx = await this.contract.createRace(
        raceId,
        name,
        trackLength,
        totalLaps
      );
      
      console.log('⏳ Transaction submitted:', tx.hash);
      const receipt = await tx.wait();
      
      // Extract race hash from events
      const raceCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'RaceCreated';
        } catch {
          return false;
        }
      });
      
      const raceHash = raceCreatedEvent ? 
        this.contract.interface.parseLog(raceCreatedEvent).args.raceHash : 
        null;
      
      console.log('✅ Race created on blockchain:', {
        txHash: receipt.hash,
        raceHash,
        gasUsed: receipt.gasUsed.toString()
      });
      
      return {
        success: true,
        txHash: receipt.hash,
        raceHash,
        explorerUrl: `${this.networkConfig.explorerUrl}/tx/${receipt.hash}`
      };
      
    } catch (error) {
      console.error('❌ Failed to create race on blockchain:', error);
      throw error;
    }
  }

  /**
   * Submit race results to blockchain
   */
  async submitRaceResults(raceHash, results) {
    if (!this.isReady()) {
      throw new Error('Blockchain service not ready');
    }

    try {
      const transactions = [];
      
      console.log('📊 Submitting race results to blockchain:', { raceHash, resultCount: results.length });
      
      // Submit each result as a separate transaction
      for (const result of results) {
        const {
          participant = this.signer.address, // Use signer address as default
          finalPosition,
          bestLapTime = 0,
          totalTime = 0,
          overtakes = 0,
          agentName
        } = result;
        
        console.log('📤 Submitting result for:', agentName, 'Position:', finalPosition);
        
        const tx = await this.contract.submitResult(
          raceHash,
          participant,
          finalPosition,
          Math.floor(bestLapTime), // Convert to integer milliseconds
          Math.floor(totalTime),
          overtakes,
          agentName
        );
        
        const receipt = await tx.wait();
        
        transactions.push({
          agentName,
          finalPosition,
          txHash: receipt.hash,
          explorerUrl: `${this.networkConfig.explorerUrl}/tx/${receipt.hash}`
        });
        
        console.log('✅ Result submitted:', agentName, 'TX:', receipt.hash);
      }
      
      console.log('🏁 All race results submitted to blockchain');
      
      return {
        success: true,
        transactions,
        totalResults: results.length
      };
      
    } catch (error) {
      console.error('❌ Failed to submit race results:', error);
      throw error;
    }
  }

  /**
   * Complete a race (no more results can be submitted)
   */
  async completeRace(raceHash) {
    if (!this.isReady()) {
      throw new Error('Blockchain service not ready');
    }

    try {
      console.log('🏁 Completing race on blockchain:', raceHash);
      
      const tx = await this.contract.completeRace(raceHash);
      const receipt = await tx.wait();
      
      console.log('✅ Race completed on blockchain:', receipt.hash);
      
      return {
        success: true,
        txHash: receipt.hash,
        explorerUrl: `${this.networkConfig.explorerUrl}/tx/${receipt.hash}`
      };
      
    } catch (error) {
      console.error('❌ Failed to complete race:', error);
      throw error;
    }
  }

  /**
   * Get race data from blockchain
   */
  async getRaceData(raceHash) {
    if (!this.contract) {
      throw new Error('Contract not available');
    }

    try {
      const race = await this.contract.getRace(raceHash);
      const results = await this.contract.getRaceResults(raceHash);
      
      return {
        race: {
          raceId: race.raceId,
          raceName: race.raceName,
          trackLength: Number(race.trackLength),
          totalLaps: Number(race.totalLaps),
          startTime: Number(race.startTime),
          endTime: Number(race.endTime),
          organizer: race.organizer,
          completed: race.completed,
          resultCount: Number(race.resultCount)
        },
        results: results.map(result => ({
          participant: result.participant,
          finalPosition: Number(result.finalPosition),
          bestLapTime: Number(result.bestLapTime),
          totalTime: Number(result.totalTime),
          overtakes: Number(result.overtakes),
          timestamp: Number(result.timestamp),
          agentName: result.agentName,
          verified: result.verified
        }))
      };
      
    } catch (error) {
      console.error('❌ Failed to get race data:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard from blockchain
   */
  async getLeaderboard(raceHash) {
    if (!this.contract) {
      throw new Error('Contract not available');
    }

    try {
      const leaderboard = await this.contract.getLeaderboard(raceHash);
      
      return leaderboard.map(result => ({
        participant: result.participant,
        finalPosition: Number(result.finalPosition),
        bestLapTime: Number(result.bestLapTime),
        totalTime: Number(result.totalTime),
        overtakes: Number(result.overtakes),
        agentName: result.agentName,
        verified: result.verified
      }));
      
    } catch (error) {
      console.error('❌ Failed to get leaderboard:', error);
      throw error;
    }
  }

  /**
   * Generate blockchain integration summary for demo
   */
  generateDemoSummary() {
    return {
      blockchain: {
        network: this.networkConfig.name,
        chainId: this.networkConfig.chainId,
        explorer: this.networkConfig.explorerUrl,
        contractAddress: this.contractAddress || 'NOT_DEPLOYED',
        walletAddress: this.signer?.address || 'NOT_CONFIGURED'
      },
      features: [
        'Tamper-proof race result storage',
        'Transparent leaderboard verification',
        'Immutable event logging',
        'Decentralized tournament management',
        'Smart contract-based rewards',
        'Cross-platform result verification'
      ],
      integrationSteps: [
        '1. Deploy RaceResults.sol to Polygon Amoy',
        '2. Configure backend with contract address',
        '3. Fund deployer wallet with test MATIC',
        '4. Race results automatically anchored on-chain',
        '5. Verify results on PolygonScan explorer'
      ]
    };
  }
}

// Export singleton instance
let blockchainService = null;

export function getBlockchainService(config = {}) {
  if (!blockchainService) {
    blockchainService = new BlockchainService(config);
  }
  return blockchainService;
}

export default BlockchainService;