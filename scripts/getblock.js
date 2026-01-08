const { ethers } = require("hardhat");
async function main() {
    console.log("BLOCK:" + await ethers.provider.getBlockNumber());
}
main();
