"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG } from "@/lib/contracts";

export function useCancelInvoice() {
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();

    const cancelInvoice = async (invoiceId: bigint) => {
        const config = CONTRACT_CONFIG[chainId];
        if (!config?.address) throw new Error("Contract not deployed on this chain");

        writeContract({
            address: config.address,
            abi: AGENT_PAY_ABI,
            functionName: "cancelInvoice",
            args: [invoiceId]
        });
    };

    return {
        cancelInvoice,
        hash,
        isPending: isWritePending || isConfirming,
        isSuccess,
        error: writeError
    };
}
