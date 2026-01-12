"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG } from "@/lib/contracts";
import { useState, useEffect, useCallback } from "react";
import { useInvalidateQueries } from "./useInvalidateQueries";

export function useCreateInvoice() {
    const { writeContractAsync, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();
    const { invalidateAll } = useInvalidateQueries();
    const [isCreating, setIsCreating] = useState(false);

    // Invalidate queries when transaction succeeds
    useEffect(() => {
        if (isSuccess && isCreating) {
            console.log("Invoice creation confirmed, invalidating queries...");
            invalidateAll();
            setIsCreating(false);
        }
    }, [isSuccess, isCreating, invalidateAll]);

    // Reset on error
    useEffect(() => {
        if (receiptError && isCreating) {
            setIsCreating(false);
        }
    }, [receiptError, isCreating]);

    const createInvoice = useCallback(async (
        recipient: string,
        amount: string, // Amount already in smallest units (wei/satoshi)
        token: string,
        metadataHash: string,
        dueDate: number
    ): Promise<boolean> => {
        const tokenAddr = token === "MNT" || token === "Native" || token === ""
            ? "0x0000000000000000000000000000000000000000"
            : token;

        const config = CONTRACT_CONFIG[chainId];
        if (!config?.address) {
            console.error("Contract not deployed on this chain");
            return false;
        }

        setIsCreating(true);
        try {
            await writeContractAsync({
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
            return true;
        } catch (e) {
            console.error("Create invoice error:", e);
            setIsCreating(false);
            return false;
        }
    }, [chainId, writeContractAsync]);

    const resetState = useCallback(() => {
        reset();
        setIsCreating(false);
    }, [reset]);

    return {
        createInvoice,
        hash,
        isPending: isWritePending || isConfirming || isCreating,
        isSuccess,
        error: writeError || receiptError,
        resetState
    };
}
