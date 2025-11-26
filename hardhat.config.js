require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // load .env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "sepolia", // set Sepolia as default
  networks: {
    hardhat: {}, // local network
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, // Alchemy Sepolia RPC
      accounts: [process.env.PRIVATE_KEY] // your wallet private key
    },
  },
  solidity: "0.8.20",
};
