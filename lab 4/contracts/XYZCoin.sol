pragma solidity >=0.5.1 <0.6.0;
import "./ERC20.sol";

contract XYZCoin is ERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 0;
    uint256 public totalSupply;

    mapping (address => uint256) public balances;
    // balances: stores token balance for each address
    mapping (address => mapping (address => uint256)) public allowed;
    // allowed[owner][spender]: stores the approval allowance, how many tokens spender can spend on behalf of owner

    constructor() public {
        name = "XYZCoin";
        symbol = "XYZ";
        totalSupply = 1000;
        balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function balanceOf(address _owner) external view returns (uint256) {
        return balances[_owner];
    }

    function transfer(address _to, uint256 _value) external returns (bool) {
        require(balances[msg.sender] >= _value, "Insufficient balance");
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) external returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
        require(balances[_from] >= _value, "Insufficient balance");
        require(allowed[_from][msg.sender] >= _value, "Allowance exceeded");
        balances[_from] -= _value;
        balances[_to] += _value;
        allowed[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function allowance(address _owner, address _spender) external view returns (uint256) {
        return allowed[_owner][_spender];
    }
}
