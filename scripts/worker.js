const hre = require("hardhat");

const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";

// Network-specific contract addresses
const CONTRACT_CONFIG = {
    5003: "0x250a83CC3Db28e0819b263c8E086F2d0d92a3E9f", // Mantle Sepolia
    5000: "0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3", // Mantle Mainnet
};

async function main() {
    // Check for PRIVATE_KEY first
    if (!process.env.PRIVATE_KEY) {
        console.error("❌ PRIVATE_KEY environment variable is not set!");
        console.error("   Please add PRIVATE_KEY as a GitHub secret.");
        process.exit(1);
    }

    const signers = await hre.ethers.getSigners();
    if (!signers || signers.length === 0) {
        console.error("❌ No signers available. Check your PRIVATE_KEY.");
        process.exit(1);
    }
    const signer = signers[0];

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

                            // Check balance
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

            if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
                console.log("⚠️ Rate limited. Waiting 60 seconds...");
                await new Promise(resolve => setTimeout(resolve, 60000));
                continue;
            }
        }

        // Wait 30 seconds (increased to avoid rate limits)
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
