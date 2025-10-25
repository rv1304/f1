// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RaceResults
 * @dev Smart contract for storing tamper-proof racing results on Polygon Amoy
 * @author VelocityForge Team
 */
contract RaceResults {
    
    struct Result {
        address participant;      // Wallet address of participant
        uint256 finalPosition;   // Final race position (1st, 2nd, etc.)
        uint256 bestLapTime;     // Best lap time in milliseconds
        uint256 totalTime;       // Total race time in milliseconds
        uint256 overtakes;       // Number of overtakes performed
        uint256 timestamp;       // Block timestamp when result was recorded
        string agentName;        // Name of the racing agent
        bool verified;           // Whether result has been verified
    }
    
    struct Race {
        string raceId;           // Unique race identifier
        string raceName;         // Human-readable race name
        uint256 trackLength;     // Track length in meters
        uint256 totalLaps;       // Number of laps in the race
        uint256 startTime;       // Race start timestamp
        uint256 endTime;         // Race end timestamp
        address organizer;       // Address of race organizer
        bool completed;          // Whether race is completed
        uint256 resultCount;     // Number of results submitted
    }
    
    // Events
    event RaceCreated(
        bytes32 indexed raceHash,
        string raceId,
        string raceName,
        address organizer
    );
    
    event ResultSubmitted(
        bytes32 indexed raceHash,
        address indexed participant,
        uint256 finalPosition,
        uint256 bestLapTime,
        string agentName
    );
    
    event RaceCompleted(
        bytes32 indexed raceHash,
        string raceId,
        uint256 totalParticipants
    );
    
    // State variables
    mapping(bytes32 => Race) public races;
    mapping(bytes32 => Result[]) public raceResults;
    mapping(bytes32 => mapping(address => bool)) public hasSubmitted;
    mapping(address => bytes32[]) public participantRaces;
    
    bytes32[] public allRaces;
    
    // Modifiers
    modifier onlyRaceOrganizer(bytes32 raceHash) {
        require(races[raceHash].organizer == msg.sender, "Only race organizer can call this");
        _;
    }
    
    modifier raceExists(bytes32 raceHash) {
        require(bytes(races[raceHash].raceId).length > 0, "Race does not exist");
        _;
    }
    
    modifier raceNotCompleted(bytes32 raceHash) {
        require(!races[raceHash].completed, "Race already completed");
        _;
    }
    
    modifier hasNotSubmitted(bytes32 raceHash) {
        require(!hasSubmitted[raceHash][msg.sender], "Result already submitted");
        _;
    }
    
    /**
     * @dev Create a new race
     * @param _raceId Unique identifier for the race
     * @param _raceName Human-readable name for the race
     * @param _trackLength Length of the track in meters
     * @param _totalLaps Number of laps in the race
     */
    function createRace(
        string memory _raceId,
        string memory _raceName,
        uint256 _trackLength,
        uint256 _totalLaps
    ) external returns (bytes32) {
        bytes32 raceHash = keccak256(abi.encodePacked(_raceId, msg.sender, block.timestamp));
        
        require(bytes(races[raceHash].raceId).length == 0, "Race already exists");
        
        races[raceHash] = Race({
            raceId: _raceId,
            raceName: _raceName,
            trackLength: _trackLength,
            totalLaps: _totalLaps,
            startTime: block.timestamp,
            endTime: 0,
            organizer: msg.sender,
            completed: false,
            resultCount: 0
        });
        
        allRaces.push(raceHash);
        
        emit RaceCreated(raceHash, _raceId, _raceName, msg.sender);
        
        return raceHash;
    }
    
    /**
     * @dev Submit race result for a participant
     * @param raceHash Hash of the race
     * @param participant Address of the participant
     * @param finalPosition Final position in the race (1-based)
     * @param bestLapTime Best lap time in milliseconds
     * @param totalTime Total race time in milliseconds
     * @param overtakes Number of overtakes performed
     * @param agentName Name of the racing agent
     */
    function submitResult(
        bytes32 raceHash,
        address participant,
        uint256 finalPosition,
        uint256 bestLapTime,
        uint256 totalTime,
        uint256 overtakes,
        string memory agentName
    ) external raceExists(raceHash) onlyRaceOrganizer(raceHash) raceNotCompleted(raceHash) {
        require(finalPosition > 0, "Position must be greater than 0");
        require(participant != address(0), "Invalid participant address");
        require(!hasSubmitted[raceHash][participant], "Result already submitted for this participant");
        
        Result memory newResult = Result({
            participant: participant,
            finalPosition: finalPosition,
            bestLapTime: bestLapTime,
            totalTime: totalTime,
            overtakes: overtakes,
            timestamp: block.timestamp,
            agentName: agentName,
            verified: true
        });
        
        raceResults[raceHash].push(newResult);
        hasSubmitted[raceHash][participant] = true;
        participantRaces[participant].push(raceHash);
        races[raceHash].resultCount++;
        
        emit ResultSubmitted(
            raceHash,
            participant,
            finalPosition,
            bestLapTime,
            agentName
        );
    }
    
    /**
     * @dev Complete a race (no more results can be submitted)
     * @param raceHash Hash of the race to complete
     */
    function completeRace(bytes32 raceHash) 
        external 
        raceExists(raceHash) 
        onlyRaceOrganizer(raceHash) 
        raceNotCompleted(raceHash) 
    {
        races[raceHash].completed = true;
        races[raceHash].endTime = block.timestamp;
        
        emit RaceCompleted(raceHash, races[raceHash].raceId, races[raceHash].resultCount);
    }
    
    /**
     * @dev Get race information
     * @param raceHash Hash of the race
     * @return Race struct data
     */
    function getRace(bytes32 raceHash) external view raceExists(raceHash) returns (Race memory) {
        return races[raceHash];
    }
    
    /**
     * @dev Get all results for a race
     * @param raceHash Hash of the race
     * @return Array of Result structs
     */
    function getRaceResults(bytes32 raceHash) external view raceExists(raceHash) returns (Result[] memory) {
        return raceResults[raceHash];
    }
    
    /**
     * @dev Get results for a specific participant
     * @param participant Address of the participant
     * @return Array of race hashes the participant has results for
     */
    function getParticipantRaces(address participant) external view returns (bytes32[] memory) {
        return participantRaces[participant];
    }
    
    /**
     * @dev Get winner of a race (participant with position 1)
     * @param raceHash Hash of the race
     * @return Address of the winner, or address(0) if no winner found
     */
    function getRaceWinner(bytes32 raceHash) external view raceExists(raceHash) returns (address) {
        Result[] memory results = raceResults[raceHash];
        
        for (uint256 i = 0; i < results.length; i++) {
            if (results[i].finalPosition == 1) {
                return results[i].participant;
            }
        }
        
        return address(0);
    }
    
    /**
     * @dev Get leaderboard for a race (sorted by position)
     * @param raceHash Hash of the race
     * @return Array of Results sorted by position
     */
    function getLeaderboard(bytes32 raceHash) external view raceExists(raceHash) returns (Result[] memory) {
        Result[] memory results = raceResults[raceHash];
        
        // Simple bubble sort by final position
        for (uint256 i = 0; i < results.length; i++) {
            for (uint256 j = 0; j < results.length - i - 1; j++) {
                if (results[j].finalPosition > results[j + 1].finalPosition) {
                    Result memory temp = results[j];
                    results[j] = results[j + 1];
                    results[j + 1] = temp;
                }
            }
        }
        
        return results;
    }
    
    /**
     * @dev Get total number of races
     * @return Number of races created
     */
    function getTotalRaces() external view returns (uint256) {
        return allRaces.length;
    }
    
    /**
     * @dev Get all race hashes
     * @return Array of all race hashes
     */
    function getAllRaces() external view returns (bytes32[] memory) {
        return allRaces;
    }
    
    /**
     * @dev Get race statistics
     * @param raceHash Hash of the race
     * @return totalParticipants Number of participants
     * @return avgLapTime Average best lap time
     * @return totalOvertakes Total number of overtakes
     */
    function getRaceStatistics(bytes32 raceHash) 
        external 
        view 
        raceExists(raceHash) 
        returns (uint256 totalParticipants, uint256 avgLapTime, uint256 totalOvertakes) 
    {
        Result[] memory results = raceResults[raceHash];
        totalParticipants = results.length;
        
        if (totalParticipants == 0) {
            return (0, 0, 0);
        }
        
        uint256 sumLapTimes = 0;
        totalOvertakes = 0;
        
        for (uint256 i = 0; i < results.length; i++) {
            sumLapTimes += results[i].bestLapTime;
            totalOvertakes += results[i].overtakes;
        }
        
        avgLapTime = sumLapTimes / totalParticipants;
    }
    
    /**
     * @dev Emergency function to update result verification status
     * @param raceHash Hash of the race
     * @param participant Address of the participant
     * @param verified New verification status
     */
    function updateResultVerification(
        bytes32 raceHash,
        address participant,
        bool verified
    ) external raceExists(raceHash) onlyRaceOrganizer(raceHash) {
        Result[] storage results = raceResults[raceHash];
        
        for (uint256 i = 0; i < results.length; i++) {
            if (results[i].participant == participant) {
                results[i].verified = verified;
                break;
            }
        }
    }
}