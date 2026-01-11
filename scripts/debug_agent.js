const hre = require("hardhat");

const CONTRACT_CONFIG = {
    5003: "0xc66bf8Cb3572d6dE4f47B4775997070606f32Fd8", // Old Sepolia
    5000: "0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3", // Mainnet
};

// Override with the NEW address if you suspect it's deployed there
// const SEPOLIA_ADDR = "0xA1c85b0176F5500Ce050D843e9D3B4B057519B33"; 

async function main() {
    const network = await hre.ethers.provider.getNetwork();
    const chainId = Number(network.chainId);
    console.log("Checking Agent 4 on Chain ID:", chainId);

    // Use current address from file or fallback
    let address = process.env.CONTRACT_ADDRESS;
    try {
        const fs = require('fs');
        const deployed = fs.readFileSync('deployed_address.txt', 'utf8').trim();
        if (deployed) address = deployed;
    } catch (e) { }

    if (!address) {
        address = CONTRACT_CONFIG[chainId];
    }

    console.log("Contract Address:", address);

    const AgentPay = await hre.ethers.getContractFactory("AgentPay");
    const agentPay = AgentPay.attach(address);

    try {
        const agent = await agentPay.getScheduledPayment(4);
        console.log("Agent #4 Details:");
        console.log("- ID:", agent.id.toString());
        console.log("- Owner:", agent.from);
        console.log("- Amount:", hre.ethers.formatEther(agent.amount), "MNT");
        console.log("- Balance:", hre.ethers.formatEther(agent.balance), "MNT");
        console.log("- Token Balance:", hre.ethers.formatEther(agent.tokenBalance));
        console.log("- Is Active:", agent.isActive);
    } catch (e) {
        console.error("Error reading agent 4:", e.message);
    }

    // Check script logic for reading balance
    // The worker.js uses `agent.balance` directly.
}

main().catch(console.error);
