const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("Checking environment...");
    const rawKey = process.env.PRIVATE_KEY;

    if (!rawKey) {
        console.error("❌ process.env.PRIVATE_KEY is UNDEFINED or EMPTY.");
    } else {
        console.log(`✅ process.env.PRIVATE_KEY found (Length: ${rawKey.length})`);
        console.log(`   Starts with: ${rawKey.substring(0, 4)}...`);
    }

    const accounts = hre.config.networks.mantle.accounts;
    console.log("Hardhat Config 'mantle' accounts:", accounts);

    const signers = await hre.ethers.getSigners();
    console.log("Ethers Signers count:", signers.length);
}

main().catch(console.error);
