// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VoteToken {
    
    // State variables
    string public name = "VoteToken";
    string public symbol = "VTKN";
    uint8 public decimals = 18;
    uint256 public totalSupply;  // totalSupply is initialSupply, given to msg.sender on deployment
    mapping(address => uint256) public balanceOf; // query the balance of an address
    mapping(address => mapping(address => uint256)) public allowance; // query the allowance value between two addresses

    // Events: Emit data to the blockchain. DApps listen for these events and react accordingly.
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Constructor  
    constructor(uint256 _initialSupply) {
        // Gives msg.sender all the tokens initial supply setting it to the total supply.
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Transfer Function
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance for transfer");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // Approve Function
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance for approval.");
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }


    // Delegated Transfer Function ('from' is owner, 'msg.sender' is spender. Ex: Uniswap)
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

        // Checks the owner has more tokens than what the spender will spend.
        require(_value <= balanceOf[_from], "Insufficient balance.");
        // Checks the value of allowance between owner and spender, making sure it's more than what the spender will spend.
        require(_value <= allowance[_from][msg.sender], "Allowance value exceeded.");

        // Decrements value from owner, increments value to 3rd party end recipient.
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // Decrements spenders total allowance.
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }
}