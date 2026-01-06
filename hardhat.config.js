require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.27",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
        mantleSepolia: {
            url: "https://rpc.sepolia.mantle.xyz",
            chainId: 5003,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
        mantle: {
            url: "https://rpc.mantle.xyz",
            chainId: 5000,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        }
    },
};


