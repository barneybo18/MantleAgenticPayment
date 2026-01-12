"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG } from "@/lib/contracts";
import { useState, useEffect, useCallback } from "react";
import { useInvalidateQueries } from "./useInvalidateQueries";

export function useCancelInvoice() {
    const { writeContractAsync, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();
    const { invalidateAll } = useInvalidateQueries();
    const [isCancelling, setIsCancelling] = useState(false);

    // Invalidate queries when transaction succeeds
    useEffect(() => {
        if (isSuccess && isCancelling) {
            console.log("Invoice cancellation confirmed, invalidating queries...");
            invalidateAll();
            setIsCancelling(false);
        }
    }, [isSuccess, isCancelling, invalidateAll]);

    // Reset on error
    useEffect(() => {
        if (receiptError && isCancelling) {
            setIsCancelling(false);
        }
    }, [receiptError, isCancelling]);

    const cancelInvoice = useCallback(async (invoiceId: bigint): Promise<boolean> => {
        const config = CONTRACT_CONFIG[chainId];
        if (!config?.address) {
            console.error("Contract not deployed on this chain");
            return false;
        }

        setIsCancelling(true);
        try {
            await writeContractAsync({
                address: config.address,
                abi: AGENT_PAY_ABI,
                functionName: "cancelInvoice",
                args: [invoiceId]
            });
            return true;
        } catch (e) {
            console.error("Cancel invoice error:", e);
            setIsCancelling(false);
            return false;
        }
    }, [chainId, writeContractAsync]);

    const resetState = useCallback(() => {
        reset();
        setIsCancelling(false);
    }, [reset]);

    return {
        cancelInvoice,
        hash,
        isPending: isWritePending || isConfirming || isCancelling,
        isSuccess,
        error: writeError || receiptError,
        resetState
    };
}
