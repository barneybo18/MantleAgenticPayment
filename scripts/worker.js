const hre = require("hardhat");

const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";

// Network-specific contract addresses
const CONTRACT_CONFIG = {
    5003: "0xc66bf8Cb3572d6dE4f47B4775997070606f32Fd8", // Mantle Sepolia
    5000: "0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3", // Mantle Mainnet
};

async function main() {
    const [signer] = await hre.ethers.getSigners();
    const network = await hre.ethers.provider.getNetwork();
    const chainId = Number(network.chainId);

    console.log("🤖 Agent Automation Worker started");
    console.log("🔑 Operator:", signer.address);
    console.log("🌐 Network:", hre.network.name, `(Chain ID: ${chainId})`);

    // Get contract address based on network
    const contractAddress = CONTRACT_CONFIG[chainId];
    if (!contractAddress) {
        console.error(`❌ No contract configured for chain ID ${chainId}`);
        process.exit(1);
    }

    console.log("📝 Contract:", contractAddress);

    const AgentPay = await hre.ethers.getContractFactory("AgentPay");
    const agentPay = AgentPay.attach(contractAddress);

    console.log("🚀 Automation loop running. Press Ctrl+C to stop.\n");

    while (true) {
        try {
            // Get count
            const count = await agentPay.nextScheduledPaymentId();
            const now = Math.floor(Date.now() / 1000);

            let activeCount = 0;
            let processedCount = 0;

            for (let i = 0; i < count; i++) {
                try {
                    const agent = await agentPay.getScheduledPayment(i);

                    const isNative = agent.token === NATIVE_TOKEN;
                    const balance = isNative ? agent.balance : agent.tokenBalance;

                    // Skip cancelled/deleted agents (isActive=false AND no balance)
                    const isCancelled = !agent.isActive && agent.balance === 0n && agent.tokenBalance === 0n;
                    if (isCancelled) {
                        continue; // Skip this agent entirely
                    }

                    activeCount++;

                    if (agent.isActive) {
                        const due = Number(agent.nextExecution);
                        const balanceLabel = isNative ? "MNT" : "Tokens";

                        if (now >= due) {
                            console.log(`⚡ Agent #${i} is DUE! (Due: ${new Date(due * 1000).toLocaleTimeString()})`);
                            console.log(`   Token: ${isNative ? "Native MNT" : agent.token}`);
                            console.log(`   Recipient: ${agent.to}`);

                            // Check balance (native or token)
                            if (balance >= agent.amount) {
                                console.log(`   Balance OK (${hre.ethers.formatEther(balance)} ${balanceLabel}). Executing...`);
                                try {
                                    // Estimate gas first to ensure transaction will succeed
                                    const estimatedGas = await agentPay.executeScheduledPayment.estimateGas(i);
                                    console.log(`   Estimated gas: ${estimatedGas.toString()}`);

                                    // Execute with 20% buffer on estimated gas
                                    const gasLimit = (estimatedGas * 120n) / 100n;
                                    const tx = await agentPay.executeScheduledPayment(i, { gasLimit });
                                    console.log(`   ⏳ Transaction sent: ${tx.hash}`);
                                    await tx.wait();
                                    console.log(`   ✅ Execution Confirmed!`);
                                } catch (execErr) {
                                    console.error(`   ❌ Execution failed: ${execErr.reason || execErr.message}`);
                                    // Log more details for debugging
                                    if (execErr.data) {
                                        console.error(`   Error data:`, execErr.data);
                                    }
                                }
                            } else {
                                console.log(`   ❌ Insufficient Balance: ${hre.ethers.formatEther(balance)} < ${hre.ethers.formatEther(agent.amount)} ${balanceLabel}`);
                            }
                        }
                    }
                    processedCount++;
                } catch (err) {
                    console.error(`Error checking agent #${i}:`, err.message);
                }
            }

            console.log(`\n📊 Checked at ${new Date().toLocaleTimeString()}: ${activeCount} visible agents (${count} total IDs)`);
        } catch (error) {
            console.error("Loop error:", error.message);
        }

        // Wait 10 seconds
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
