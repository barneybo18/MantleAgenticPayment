const hre = require("hardhat");

async function main() {
    console.log("Deploying AgentPay contract...");
    console.log("Network:", hre.network.name);

    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();

    if (!deployer) {
        throw new Error("No deployer account found. Make sure PRIVATE_KEY is set in .env file");
    }

    console.log("Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "MNT");

    if (balance === 0n) {
        throw new Error("Account has no balance. Get testnet MNT from https://faucet.sepolia.mantle.xyz");
    }

    const AgentPay = await hre.ethers.getContractFactory("AgentPay", deployer);
    const agentPay = await AgentPay.deploy();

    await agentPay.waitForDeployment();

    const address = await agentPay.getAddress();
    console.log("");
    console.log("✅ AgentPay deployed to:", address);
    console.log("");
    console.log("Update your lib/contracts.ts with:");
    console.log(`export const AGENT_PAY_ADDRESS = "${address}" as const;`);
}

main().catch((error) => {
    console.error("Deployment failed:", error.message);
    process.exitCode = 1;
});
