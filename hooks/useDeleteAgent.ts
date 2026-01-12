"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient, useAccount } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from "@/lib/contracts";
import { useState, useEffect, useCallback } from "react";
import { useInvalidateQueries } from "./useInvalidateQueries";

// Helper to extract readable error message from contract revert
function extractErrorMessage(error: unknown): string {
    const errorStr = String(error);
    // Look for common revert reasons
    if (errorStr.includes("Not owner")) return "You are not the owner of this agent";
    if (errorStr.includes("No funds to refund")) return "Agent has no funds to refund";
    if (errorStr.includes("execution reverted")) {
        const match = errorStr.match(/reason:\s*([^,]+)/i);
        if (match) return match[1].trim();
    }
    return "Transaction would fail. Please try again.";
}

export function useDeleteAgent() {
    const { writeContractAsync, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const { address: userAddress } = useAccount();
    const { invalidateAll } = useInvalidateQueries();
    const [isDeleting, setIsDeleting] = useState(false);
    const [simulationError, setSimulationError] = useState<string | null>(null);

    // Invalidate queries when transaction succeeds
    useEffect(() => {
        if (isSuccess && isDeleting) {
            console.log("Agent deletion confirmed, invalidating queries...");
            invalidateAll();
            setIsDeleting(false);
        }
    }, [isSuccess, isDeleting, invalidateAll]);

    // Reset on error
    useEffect(() => {
        if (receiptError && isDeleting) {
            setIsDeleting(false);
        }
    }, [receiptError, isDeleting]);

    const deleteAgent = useCallback(async (id: bigint): Promise<{ success: boolean; error?: string }> => {
        const config = CONTRACT_CONFIG[chainId];
        const address = config?.address;

        if (!address || address === NATIVE_TOKEN) {
            return { success: false, error: "Contract not deployed on this chain" };
        }

        if (!publicClient || !userAddress) {
            return { success: false, error: "Wallet not connected" };
        }

        setIsDeleting(true);
        setSimulationError(null);

        // Step 1: Simulate the transaction to catch errors early
        try {
            await publicClient.simulateContract({
                address: address,
                abi: AGENT_PAY_ABI,
                functionName: "cancelScheduledPayment",
                args: [id],
                account: userAddress,
            });
        } catch (simError) {
            const errorMsg = extractErrorMessage(simError);
            console.error("Simulation failed:", simError);
            setSimulationError(errorMsg);
            setIsDeleting(false);
            return { success: false, error: errorMsg };
        }

        // Step 2: If simulation passed, proceed with actual transaction
        try {
            await writeContractAsync({
                address: address,
                abi: AGENT_PAY_ABI,
                functionName: "cancelScheduledPayment",
                args: [id],
            });
            return { success: true };
        } catch (e) {
            console.error("Delete agent error:", e);
            setIsDeleting(false);
            return { success: false, error: extractErrorMessage(e) };
        }
    }, [chainId, writeContractAsync, publicClient]);

    const resetState = useCallback(() => {
        reset();
        setIsDeleting(false);
        setSimulationError(null);
    }, [reset]);

    return {
        deleteAgent,
        hash,
        isPending: isWritePending || isConfirming || isDeleting,
        isSuccess,
        error: writeError || receiptError,
        simulationError,
        resetState
    };
}
