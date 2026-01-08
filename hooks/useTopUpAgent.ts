"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from "@/lib/contracts";

export function useTopUpAgent() {
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();

    const topUpAgent = async (id: bigint, amount: bigint, tokenAmount: bigint = 0n) => {
        const config = CONTRACT_CONFIG[chainId];
        const address = config?.address;

        if (!address || address === NATIVE_TOKEN) return;

        writeContract({
            address: address,
            abi: AGENT_PAY_ABI,
            functionName: "topUpAgent",
            args: [id, tokenAmount],
            value: amount
        });
    };

    return {
        topUpAgent,
        hash,
        isPending: isWritePending || isConfirming,
        isSuccess,
        error: writeError
    };
}
