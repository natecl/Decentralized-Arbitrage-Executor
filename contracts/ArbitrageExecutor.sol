
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  //Solidity version

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract ArbitrageExecutor is ReentrancyGuard{
    //ETH Balances
    mapping(address => uint256) public balances;
    //ERC20 token balances
    mapping(address => mapping(address => uint256)) public tokenBalances;
    //Events
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    //Deposit ETH
    function deposit() external payable nonReentrant {
        //increases sender's balance
        balances[msg.sender] += msg.value;

        emit Deposit(msg.sender, msg.value);
    }
    //Withdraw ETH
    function withdraw(uint256 amount) external nonReentrant{
        require(balances[msg.sender] >= amount, "Insufficient balances");
        
        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdraw failed");

        emit Withdraw(msg.sender, amount);
    }
    //Deposit ERC20 tokens
    function deposit(address token, uint256 amount) external nonReentrant{
        require(amount > 0, "Amount must be greater than zero");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        tokenBalances[msg.sender][token] += amount;
        
        emit Deposit(msg.sender, amount);
    }
    //Withdraw ERC20 tokens
    function withdrawToken(address token, uint256 amount) external nonReentrant{
        require(tokenBalances[msg.sender][token] >= amount, "Insufficient token balance");
        
        tokenBalances[msg.sender][token] -= amount;

        IERC20(token).transfer(msg.sender,amount);

        emit Withdraw(msg.sender, amount);
    }
}