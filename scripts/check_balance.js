const hre = require("hardhat");

async function main() {
    console.log("Checking balance on:", hre.network.name);
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    if (!deployer) {
        console.error("No deployer!");
        return;
    }
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "MNT");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
