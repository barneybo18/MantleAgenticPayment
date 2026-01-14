"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from "@/lib/contracts";
import { useState, useEffect, useCallback } from "react";
import { useInvalidateQueries } from "./useInvalidateQueries";

function extractErrorMessage(error: unknown): string {
    const errorStr = String(error);
    if (errorStr.includes("Not owner")) return "You are not the owner of this agent";
    if (errorStr.includes("End date too soon")) return "End date must be further in the future";
    if (errorStr.includes("execution reverted")) {
        const match = errorStr.match(/reason:\s*([^,]+)/i);
        if (match) return match[1].trim();
    }
    return "Transaction would fail. Please try again.";
}

export function useUpdateAgent() {
    const { writeContractAsync, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const { invalidateAll } = useInvalidateQueries();
    const [isUpdating, setIsUpdating] = useState(false);
    const [simulationError, setSimulationError] = useState<string | null>(null);

    // Invalidate queries when transaction succeeds
    useEffect(() => {
        if (isSuccess && isUpdating) {
            console.log("Agent update confirmed, invalidating queries...");
            invalidateAll();
            setIsUpdating(false);
        }
    }, [isSuccess, isUpdating, invalidateAll]);

    // Reset on error
    useEffect(() => {
        if (receiptError && isUpdating) {
            setIsUpdating(false);
        }
    }, [receiptError, isUpdating]);

    const updateAgent = useCallback(async (id: bigint, endDate: bigint): Promise<{ success: boolean; error?: string }> => {
        const config = CONTRACT_CONFIG[chainId];
        const address = config?.address;

        if (!address || address === NATIVE_TOKEN) {
            return { success: false, error: "Contract not deployed on this chain" };
        }

        if (!publicClient) {
            return { success: false, error: "Wallet not connected" };
        }

        setIsUpdating(true);
        setSimulationError(null);

        // Step 1: Simulate the transaction
        try {
            await publicClient.simulateContract({
                address: address,
                abi: AGENT_PAY_ABI,
                functionName: "updateScheduledPayment",
                args: [id, endDate],
            });
        } catch (simError) {
            const errorMsg = extractErrorMessage(simError);
            console.error("Simulation failed:", simError);
            setSimulationError(errorMsg);
            setIsUpdating(false);
            return { success: false, error: errorMsg };
        }

        // Step 2: Proceed with transaction
        try {
            await writeContractAsync({
                address: address,
                abi: AGENT_PAY_ABI,
                functionName: "updateScheduledPayment",
                args: [id, endDate],
            });
            return { success: true };
        } catch (e) {
            console.error("Update agent error:", e);
            setIsUpdating(false);
            return { success: false, error: extractErrorMessage(e) };
        }
    }, [chainId, writeContractAsync, publicClient]);

    const resetState = useCallback(() => {
        reset();
        setIsUpdating(false);
        setSimulationError(null);
    }, [reset]);

    return {
        updateAgent,
        hash,
        isPending: isWritePending || isConfirming || isUpdating,
        isSuccess,
        error: writeError || receiptError,
        simulationError,
        resetState
    };
}
