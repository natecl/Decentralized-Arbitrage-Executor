
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  //Solidity version

import "@openzeppelin/utils/ReentrancyGuard.sol";

contract ArbitrageExecutor is ReentrancyGuard{

    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    function deposit() external payable nonReentrant {
        //increases sender's balance
        balances[msg.sender] += msg.value;

        emit Deposit(msg.sender, msg.value);
    }
    function withdraw(uint256 amount) external nonReentrant{
        require(balances[msg.sender] >= amount, "Insufficient balances");
        
        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdraw failed");

        emit Withdraw(msg.sender, amount);
    }
}