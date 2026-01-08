const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🌱 Starting Seed Script...");

    // Get the main account (User's wallet)
    const [user] = await ethers.getSigners();
    console.log(`👤 User Address: ${user.address}`);

    // Get Contract Address
    // We assume the contract is already deployed and we want to interact with it.
    // Ideally we fetch it from the deployment or lib/contracts.ts
    // For now, I'll fetch the deployed instance if running on localhost, 
    // or use the known address for Mantle Sepolia.

    // CHANGE THIS IF YOU REDEPLOY
    const CONTRACT_ADDRESS = "0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3";

    const agentPay = await ethers.getContractAt("AgentPay", CONTRACT_ADDRESS);
    console.log(`🔗 Attach to Contract: ${CONTRACT_ADDRESS}`);

    // 1. Create Invoices FROM user (Populate "Sent" list)
    console.log("\n📤 Creating 3 'Sent' Invoices...");
    for (let i = 1; i <= 3; i++) {
        // Send to a random address
        const randomRecipient = ethers.Wallet.createRandom().address;
        const amount = ethers.parseEther((i * 10).toString()); // 10, 20, 30 MNT
        const dueDate = Math.floor(Date.now() / 1000) + (86400 * 7); // 7 days from now

        console.log(`   ${i}. Invoicing ${randomRecipient.slice(0, 6)}... for ${i * 10} MNT`);

        const tx = await agentPay.connect(user).createInvoice(
            randomRecipient,
            amount,
            ethers.ZeroAddress, // Native MNT
            `Test Invoice #${i}`,
            BigInt(dueDate)
        );
        await tx.wait();
    }

    // 2. Create Invoices TO user (Populate "Received" list -> Payment Testing)
    console.log("\n📥 Creating 3 'Received' Invoices (So you can pay them)...");

    // Create a temporary wallet
    const provider = user.provider;
    const tempWallet = ethers.Wallet.createRandom().connect(provider);
    console.log(`   🤖 Temp Wallet: ${tempWallet.address}`);

    // Fund temp wallet for gas (0.5 MNT)
    console.log("   Funding temp wallet...");
    const fundTx = await user.sendTransaction({
        to: tempWallet.address,
        value: ethers.parseEther("0.1")
    });
    await fundTx.wait();

    // Create invoices from temp wallet -> user
    for (let i = 1; i <= 3; i++) {
        const amount = ethers.parseEther((i * 5).toString()); // 5, 10, 15 MNT
        const dueDate = Math.floor(Date.now() / 1000) + (86400 * 3); // 3 days from now

        console.log(`   ${i}. Receiving invoice for ${i * 5} MNT...`);

        const tx = await agentPay.connect(tempWallet).createInvoice(
            user.address,
            amount,
            ethers.ZeroAddress,
            `Service Fee #${i}`,
            BigInt(dueDate)
        );
        await tx.wait();
    }

    console.log("\n✅ Seed Complete! Refresh your dashboard.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
