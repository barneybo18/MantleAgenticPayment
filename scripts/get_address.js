const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    if (!deployer) return;
    console.log("ADDRESS_START");
    console.log(deployer.address);
    console.log("ADDRESS_END");
}

main().catch((error) => {
    process.exitCode = 1;
});
