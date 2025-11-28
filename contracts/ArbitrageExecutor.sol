// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}
interface IUniswapV3Router {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);
}

contract ArbitrageExecutor is ReentrancyGuard {

    address public immutable UNISWAP_ROUTER;
    address public owner;

    // ETH balances
    mapping(address => uint256) public balances;

    // ERC20 token balances
    mapping(address => mapping(address => uint256)) public tokenBalances;

    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event SwapExecuted(
        address indexed caller,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event ProfitLogged(uint256 profit);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address router) {
        owner = msg.sender;
        UNISWAP_ROUTER = router;
    }

    // ETH deposit
    function deposit() external payable nonReentrant {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // ETH withdraw (owner only)
    function withdraw(uint256 amount) external nonReentrant onlyOwner {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdraw failed");

        emit Withdraw(msg.sender, amount);
    }

    // ERC20 deposit
    function deposit(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        tokenBalances[msg.sender][token] += amount;
        emit Deposit(msg.sender, amount);
    }

    // ERC20 withdraw (owner only)
    function withdrawToken(address token, uint256 amount) external nonReentrant onlyOwner {
        require(tokenBalances[msg.sender][token] >= amount, "Insufficient token balance");
        tokenBalances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }

    // Swap on Uniswap V2
    function executeSwap(
        address tokenIn,
        address tokenOut,
        uint256 amount
    ) external nonReentrant returns (uint256 amountOutReceived) {

        require(amount > 0, "Amount must be > 0");

        // Ensure user approved contract
        require(
            IERC20(tokenIn).allowance(msg.sender, address(this)) >= amount,
            "Approve contract first"
        );

        // Pull tokens from user
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amount);
        tokenBalances[msg.sender][tokenIn] -= amount;

        // Approve Uniswap router
        IERC20(tokenIn).approve(UNISWAP_ROUTER, amount);

        // Create swap path
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        // Minimum output (5% slippage tolerance)
        uint256 minOut = (amount * 95) / 100;

        uint256[] memory amounts = IUniswapV2Router(UNISWAP_ROUTER)
            .swapExactTokensForTokens(
                amount,
                minOut,
                path,
                address(this),
                block.timestamp
            );

        amountOutReceived = amounts[1];

        // Update user token balance
        tokenBalances[msg.sender][tokenOut] += amountOutReceived;

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amount, amountOutReceived);

        uint256 profit = 0;
        if (amountOutReceived > amount) {
            profit = amountOutReceived - amount;
        }
        emit ProfitLogged(profit);
    }
}
