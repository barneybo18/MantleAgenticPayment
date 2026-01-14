"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from "@/lib/contracts";
import { useState, useEffect, useCallback } from "react";
import { useInvalidateQueries } from "./useInvalidateQueries";

export function useToggleAgentStatus() {
    const { writeContractAsync, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();
    const { invalidateAll } = useInvalidateQueries();
    const [isToggling, setIsToggling] = useState(false);

    useEffect(() => {
        if (isSuccess && isToggling) {
            console.log("Agent status toggle confirmed, invalidating queries...");
            invalidateAll();
            setIsToggling(false);
        }
    }, [isSuccess, isToggling, invalidateAll]);

    useEffect(() => {
        if (receiptError && isToggling) {
            setIsToggling(false);
        }
    }, [receiptError, isToggling]);

    const toggleAgentStatus = useCallback(async (id: bigint, isActive: boolean): Promise<boolean> => {
        const config = CONTRACT_CONFIG[chainId];
        if (!config?.address || config.address === NATIVE_TOKEN) {
            console.error("Contract not deployed on this chain");
            return false;
        }

        setIsToggling(true);
        try {
            await writeContractAsync({
                address: config.address,
                abi: AGENT_PAY_ABI,
                functionName: "toggleAgentStatus",
                args: [id, isActive]
            });
            return true;
        } catch (e) {
            console.error("Toggle agent status error:", e);
            setIsToggling(false);
            return false;
        }
    }, [chainId, writeContractAsync]);

    const resetState = useCallback(() => {
        reset();
        setIsToggling(false);
    }, [reset]);

    return {
        toggleAgentStatus,
        hash,
        isPending: isWritePending || isConfirming || isToggling,
        isSuccess,
        error: writeError || receiptError,
        resetState
    };
}
