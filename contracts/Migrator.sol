// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";

contract Migrator2 {
    address public immutable uniswapRouter;
    address public immutable usdc;

    constructor(address _router, address _usdc) {
        uniswapRouter = _router;
        usdc = _usdc;
    }

    struct NFTTransfer {
        address nft;
        uint256 tokenId;
    }

    struct DustSwap {
        address token;
        uint256 minOut;
    }

    /// @notice Ejecuta la migración de assets de wallet A hacia wallet B
    /// @param recipient Dirección destino (wallet B)
    function executeMigration(
        address recipient,
        address[] calldata erc20s,
        NFTTransfer[] calldata nfts,
        DustSwap[] calldata dustTokens
    ) external {
        require(recipient != address(0), "Invalid recipient");

        // 1. Transferencia de tokens ERC20
        for (uint256 i = 0; i < erc20s.length; i++) {
            _transferERC20(erc20s[i], recipient);
        }

        // 2. Transferencia de NFTs
        for (uint256 i = 0; i < nfts.length; i++) {
            IERC721(nfts[i].nft).safeTransferFrom(msg.sender, recipient, nfts[i].tokenId);
        }

        // 3. Swaps de tokens basura
        for (uint256 i = 0; i < dustTokens.length; i++) {
            _swapToUSDCFrom(msg.sender, dustTokens[i].token, dustTokens[i].minOut);
        }

        // 4. Enviar USDC al recipient (después del swap)
        uint256 usdcBalance = IERC20(usdc).balanceOf(address(this));
        if (usdcBalance > 0) {
            IERC20(usdc).transfer(recipient, usdcBalance);
        }
    }

    /// @dev Transfiere la cantidad máxima permitida por allowance y balance
    function _transferERC20(address tokenAddress, address recipient) internal {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(msg.sender);
        uint256 allowance = token.allowance(msg.sender, address(this));
        uint256 amount = balance < allowance ? balance : allowance;
        require(amount > 0, "Nothing to transfer");
        require(token.transferFrom(msg.sender, recipient, amount), "ERC20 transfer failed");
    }

    /// @dev Swappea el balance de `tokenIn` desde `from` hacia USDC en este contrato
    function _swapToUSDCFrom(address from, address tokenIn, uint256 minOut) internal {
        uint256 balance = IERC20(tokenIn).balanceOf(from);
        uint256 allowance = IERC20(tokenIn).allowance(from, address(this));
        uint256 amount = balance < allowance ? balance : allowance;

        if (amount == 0) return;

        // Tomamos los tokens del usuario
        bool pulled = IERC20(tokenIn).transferFrom(from, address(this), amount);
        require(pulled, "TransferFrom failed");

        // Swap en UniswapV3
        IERC20(tokenIn).approve(uniswapRouter, amount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: usdc,
            fee: 3000,
            recipient: address(this),
            deadline: block.timestamp + 300,
            amountIn: amount,
            amountOutMinimum: minOut,
            sqrtPriceLimitX96: 0
        });

        ISwapRouter(uniswapRouter).exactInputSingle(params);
    }
}
