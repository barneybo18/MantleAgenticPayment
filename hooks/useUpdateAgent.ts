"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from "@/lib/contracts";
import { useState, useEffect, useCallback } from "react";

export function useUpdateAgent() {
    const { writeContractAsync, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();
    const [isUpdating, setIsUpdating] = useState(false);

    const updateAgent = useCallback(async (id: bigint, endDate: bigint): Promise<boolean> => {
        const config = CONTRACT_CONFIG[chainId];
        const address = config?.address;

        if (!address || address === NATIVE_TOKEN) {
            console.error("Contract not deployed on this chain");
            return false;
        }

        setIsUpdating(true);
        try {
            await writeContractAsync({
                address: address,
                abi: AGENT_PAY_ABI,
                functionName: "updateScheduledPayment",
                args: [id, endDate]
            });
            return true;
        } catch (e) {
            console.error("Update agent error:", e);
            setIsUpdating(false);
            return false;
        }
    }, [chainId, writeContractAsync]);

    // Reset updating state when transaction completes (success or error)
    useEffect(() => {
        if (isSuccess || receiptError) {
            setIsUpdating(false);
        }
    }, [isSuccess, receiptError]);

    const resetState = useCallback(() => {
        reset();
        setIsUpdating(false);
    }, [reset]);

    return {
        updateAgent,
        hash,
        isPending: isWritePending || isConfirming || isUpdating,
        isSuccess,
        error: writeError || receiptError,
        resetState
    };
}
