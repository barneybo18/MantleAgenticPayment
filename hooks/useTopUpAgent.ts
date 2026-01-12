"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from "@/lib/contracts";
import { useState, useEffect, useCallback } from "react";
import { useInvalidateQueries } from "./useInvalidateQueries";

export function useTopUpAgent() {
    const { writeContractAsync, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();
    const { invalidateAll } = useInvalidateQueries();
    const [isTopping, setIsTopping] = useState(false);

    // Invalidate queries when transaction succeeds
    useEffect(() => {
        if (isSuccess && isTopping) {
            console.log("Top up confirmed, invalidating queries...");
            invalidateAll();
            setIsTopping(false);
        }
    }, [isSuccess, isTopping, invalidateAll]);

    // Reset on error
    useEffect(() => {
        if (receiptError && isTopping) {
            setIsTopping(false);
        }
    }, [receiptError, isTopping]);

    const topUpAgent = useCallback(async (id: bigint, amount: bigint, tokenAmount: bigint = 0n): Promise<boolean> => {
        const config = CONTRACT_CONFIG[chainId];
        const address = config?.address;

        if (!address || address === NATIVE_TOKEN) {
            console.error("Contract not deployed on this chain");
            return false;
        }

        setIsTopping(true);
        try {
            await writeContractAsync({
                address: address,
                abi: AGENT_PAY_ABI,
                functionName: "topUpAgent",
                args: [id, tokenAmount],
                value: amount
            });
            return true;
        } catch (e) {
            console.error("Top up error:", e);
            setIsTopping(false);
            return false;
        }
    }, [chainId, writeContractAsync]);

    const resetState = useCallback(() => {
        reset();
        setIsTopping(false);
    }, [reset]);

    return {
        topUpAgent,
        hash,
        isPending: isWritePending || isConfirming || isTopping,
        isSuccess,
        error: writeError || receiptError,
        resetState
    };
}
