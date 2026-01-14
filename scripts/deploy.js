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

    // Fetch the transaction receipt to get the block number
    const txHash = agentPay.deploymentTransaction().hash;
    console.log("Transaction hash:", txHash);
    console.log("Waiting for confirmation...");

    let receipt = null;
    let retries = 10;
    while (!receipt && retries > 0) {
        receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
        if (!receipt) {
            await new Promise(r => setTimeout(r, 3000)); // Wait 3 seconds
            retries--;
        }
    }

    const blockNumber = receipt ? receipt.blockNumber : "unknown";

    console.log("");
    console.log("AgentPay deployed to:", agentPay.target);
    console.log("Block Number:", blockNumber);
    console.log("Update lib/contracts.ts with:");
    console.log(`export const AGENT_PAY_ADDRESS = "${agentPay.target}" as const;`);
    console.log(`export const AGENT_PAY_DEPLOY_BLOCK = ${blockNumber}n;`);

    const fs = require("fs");
    fs.writeFileSync("deployed_address.txt", agentPay.target);
}

main().catch((error) => {
    console.error("Deployment failed:", error.message);
    process.exitCode = 1;
});
