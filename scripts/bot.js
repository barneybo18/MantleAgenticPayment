const hre = require("hardhat");
const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = "0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3";
const POLL_INTERVAL = 10000; // Check every 10 seconds

async function main() {
    console.log("🤖 AgentPay Bot Started...");
    console.log(`🔗 Monitoring Contract: ${CONTRACT_ADDRESS}`);

    const [keeper] = await ethers.getSigners();
    console.log(`👤 Keeper Address: ${keeper.address}`);

    const agentPay = await ethers.getContractAt("AgentPay", CONTRACT_ADDRESS);

    // Infinite loop to monitor
    while (true) {
        try {
            process.stdout.write("."); // heartbeat

            const nextId = await agentPay.nextScheduledPaymentId();
            const now = Math.floor(Date.now() / 1000);

            // Only log if we have agents
            if (nextId > 0n && Math.random() < 0.05) {
                console.log(`\n🔍 Checking ${nextId} agents at ${new Date().toLocaleTimeString()}...`);
            }

            for (let i = 0; i < Number(nextId); i++) {
                const payment = await agentPay.getScheduledPayment(i);

                // Convert BigInt to Number for comparison if safe, or compare BigInts
                if (payment.isActive && Number(payment.nextExecution) <= now) {
                    console.log(`\n⚡ Executing Payment #${i}...`);
                    console.log(`   From: ${payment.from}`);
                    console.log(`   To: ${payment.to}`);

                    try {
                        // Estimate gas first to check for errors/reverts
                        // const gas = await agentPay.connect(keeper).executeScheduledPayment.estimateGas(i);

                        const tx = await agentPay.connect(keeper).executeScheduledPayment(i);
                        console.log(`   Transaction sent: ${tx.hash}`);
                        await tx.wait();
                        console.log(`✅ Execution Successful!`);
                    } catch (err) {
                        console.error(`❌ Execution Failed: ${err.message}`);
                    }
                } else if (payment.isActive && i === Number(nextId) - 1 && Math.random() < 0.05) {
                    // Occasional log for monitoring
                    const diff = Number(payment.nextExecution) - now;
                    console.log(`   Agent #${i} waiting... (${diff}s left)`);
                }
            }
        } catch (e) {
            console.error("\nError in poll loop:", e.message);
        }

        // Wait before next poll
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
