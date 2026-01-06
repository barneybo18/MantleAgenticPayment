"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { AGENT_PAY_ABI, AGENT_PAY_ADDRESS } from "@/lib/contracts";
import { parseEther } from "viem";

export function useCreateInvoice() {
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const createInvoice = async (
        recipient: string,
        amount: string,
        token: string,
        metadataHash: string,
        dueDate: number
    ) => {
        const tokenAddr = token === "MNT" || token === "Native" || token === ""
            ? "0x0000000000000000000000000000000000000000"
            : token;

        writeContract({
            address: AGENT_PAY_ADDRESS,
            abi: AGENT_PAY_ABI,
            functionName: "createInvoice",
            args: [
                recipient as `0x${string}`,
                parseEther(amount),
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
