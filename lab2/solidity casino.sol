pragma solidity ^0.5.1;

// Simplified Casino Betting Game for Lab2
// Remove Oraclize external oracle dependency for easy test deployment
contract Casino {
    address public owner;
    uint public minimumBet = 100 finney;
    uint public totalBet;
    uint public numberOfBets;
    uint public maxAmountOfBets = 100;
    uint public numberWinner;

    address[] public players;
    mapping(uint => address[]) numberBetPlayers;
    mapping(address => uint) playerBetsNumber;

    event BetPlaced(address player, uint number, uint amount);
    event RoundSettled(uint winner, uint pool, uint paid, uint carried);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(uint _minimumBet, uint _maxAmountOfBets) public {
        owner = msg.sender;
        if (_minimumBet > 0) {
            minimumBet = _minimumBet;
        }
        if (_maxAmountOfBets > 0 && _maxAmountOfBets <= 100) {
            maxAmountOfBets = _maxAmountOfBets;
        }
    }

    function checkPlayerExists(address player) public view returns (bool) {
        return playerBetsNumber[player] != 0;
    }

    /// @notice Place bet: choose number 1 ~ 10
    function bet(uint numberToBet) public payable {
        require(numberOfBets < maxAmountOfBets, "Bets full, wait for draw");
        require(!checkPlayerExists(msg.sender), "You already placed a bet");
        require(numberToBet >= 1 && numberToBet <= 10, "Number must be 1‑10");
        require(msg.value >= minimumBet, "Bet value too low");

        playerBetsNumber[msg.sender] = numberToBet;
        numberBetPlayers[numberToBet].push(msg.sender);
        players.push(msg.sender);

        numberOfBets += 1;
        totalBet += msg.value;

        emit BetPlaced(msg.sender, numberToBet, msg.value);

        // Reach max bets → trigger draw immediately
        if (numberOfBets == maxAmountOfBets) {
            generateWinner();
        }
    }

    /// Simple pseudo‑random number for lab demo (NOT secure for real‑money production!)
    function generateWinner() internal {
        // blockhash + block.timestamp as weak random source for class demo
        uint random = uint(keccak256(abi.encodePacked(blockhash(block.number), block.timestamp)));
        numberWinner = (random % 10) + 1;

        distributePrizes();
    }

    function distributePrizes() internal {
        uint pool = totalBet;
        if (pool > address(this).balance) pool = address(this).balance;

        address[] memory winners = numberBetPlayers[numberWinner];
        uint share = 0;
        if (winners.length > 0) {
            share = pool / winners.length;
        }
        uint paid = share * winners.length;

        // reset all players state
        for (uint i = 0; i < players.length; i++) {
            delete playerBetsNumber[players[i]];
        }
        players.length = 0;
        for (uint j = 1; j <= 10; j++) {
            delete numberBetPlayers[j];
        }

        numberOfBets = 0;
        // leftover fund carry to next round
        totalBet = pool - paid;

        // transfer reward to every winner
        for (uint k = 0; k < winners.length; k++) {
            if (address(winners[k]).balance + share > address(winners[k]).balance) {
                address(winners[k]).transfer(share);
            }
        }

        emit RoundSettled(numberWinner, pool, paid, totalBet);
    }

    // Owner can withdraw leftover funds for test purpose
    function withdrawContractFund() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
