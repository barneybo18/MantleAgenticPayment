"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG } from "@/lib/contracts";
import { useState, useEffect, useCallback } from "react";
import { useInvalidateQueries } from "./useInvalidateQueries";

export function usePayInvoice() {
    const { writeContractAsync, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();
    const { invalidateAll } = useInvalidateQueries();
    const [isPaying, setIsPaying] = useState(false);

    // Invalidate queries when transaction succeeds
    useEffect(() => {
        if (isSuccess && isPaying) {
            console.log("Invoice payment confirmed, invalidating queries...");
            invalidateAll();
            setIsPaying(false);
        }
    }, [isSuccess, isPaying, invalidateAll]);

    // Reset on error
    useEffect(() => {
        if (receiptError && isPaying) {
            setIsPaying(false);
        }
    }, [receiptError, isPaying]);

    const payInvoice = useCallback(async (invoiceId: bigint, amount: bigint): Promise<boolean> => {
        const config = CONTRACT_CONFIG[chainId];
        if (!config?.address) {
            console.error("Contract not deployed on this chain");
            return false;
        }

        setIsPaying(true);
        try {
            await writeContractAsync({
                address: config.address,
                abi: AGENT_PAY_ABI,
                functionName: "payInvoice",
                args: [invoiceId],
                value: amount
            });
            return true;
        } catch (e) {
            console.error("Pay invoice error:", e);
            setIsPaying(false);
            return false;
        }
    }, [chainId, writeContractAsync]);

    const resetState = useCallback(() => {
        reset();
        setIsPaying(false);
    }, [reset]);

    return {
        payInvoice,
        hash,
        isPending: isWritePending || isConfirming || isPaying,
        isSuccess,
        error: writeError || receiptError,
        resetState
    };
}
