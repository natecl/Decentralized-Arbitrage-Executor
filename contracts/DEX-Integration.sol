// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; //solidity version

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

contract ArbitrageExecutor {
    address public owner;
    address public immutable UNISWAP;

    event SwapExecuted(
        address indexed caller,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    event ProfitLogged(uint256 profit);

    constructor(address router) {
        owner = msg.sender;
        UNISWAP = router;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _; 
    }

    function executeSwap(
        address tokenIn,
        address tokenOut,
        uint256 amount
    ) external onlyOwner returns (uint256 amountOutReceived) {
    
    require( amount > 0, "Amount must be > 0");

    bool ok = IERC20(tokenIn).approve(UNISWAP, amount);
    require(ok, "Approve failed");

    address[] memory path = new address[](2);
    path[0] = tokenIn;
    path[1] = tokenOut;

    uint256[] memory amounts = IUniswapV2Router(UNISWAP).swapExactTokensForTokens(
        amount,
        0,
        path,
        address(this),
        block.timestamp
    );
    //from swapExactTokensForTokens, amounts[0] is input tokens amounts[1] is output tokens
    amountOutReceived = amounts[1];

    emit SwapExecuted(msg.sender, tokenIn, tokenOut, amount, amountOutReceived);
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        bool ok = IERC20(token).transfer(owner, amount);
        require(ok, "Withdraw failed");
    }
}