const hre = require("hardhat");

async function main() {
    const address = "0xA1c85b0176F5500Ce050D843e9D3B4B057519B33"; // Mantle Sepolia
    const AgentPay = await hre.ethers.getContractFactory("AgentPay");
    const agentPay = AgentPay.attach(address);

    // User's exact arguments
    const to = "0x2709C07f4C2BFc886aF9f0900407Ed28d65F744B";
    const amount = "10000000000000000"; // 0.01 ETH
    const token = "0x0000000000000000000000000000000000000000";
    const interval = 3600;
    const description = "Hourly test for the agent";
    const initialTokenDeposit = 0;
    const endDate = 0;
    const value = "500000000000000000"; // 0.5 ETH

    console.log("Simulating createScheduledPayment...");

    try {
        const tx = await agentPay.createScheduledPayment.staticCall(
            to,
            amount,
            token,
            interval,
            description,
            initialTokenDeposit,
            endDate,
            { value: value }
        );
        console.log("Simulation SUCCESS! Returned ID:", tx.toString());
    } catch (error) {
        console.error("Simulation FAILED:");
        console.error(error);
    }
}

main().catch(console.error);
