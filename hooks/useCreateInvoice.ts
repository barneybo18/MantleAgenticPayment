"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG } from "@/lib/contracts";
import { parseEther } from "viem";

export function useCreateInvoice() {
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();

    const createInvoice = async (
        recipient: string,
        amount: string, // Amount already in smallest units (wei/satoshi)
        token: string,
        metadataHash: string,
        dueDate: number
    ) => {
        const tokenAddr = token === "MNT" || token === "Native" || token === ""
            ? "0x0000000000000000000000000000000000000000"
            : token;

        const config = CONTRACT_CONFIG[chainId];
        if (!config?.address) throw new Error("Contract not deployed on this chain");

        writeContract({
            address: config.address,
            abi: AGENT_PAY_ABI,
            functionName: "createInvoice",
            args: [
                recipient as `0x${string}`,
                BigInt(amount), // Amount already parsed with correct decimals
                tokenAddr as `0x${string}`,
                metadataHash,
                BigInt(dueDate)
            ]
        });
    };

    return {
        createInvoice,
        hash,
        isPending: isWritePending || isConfirming,
        isSuccess,
        error: writeError
    };
}
