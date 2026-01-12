"use client";

import { useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient, useAccount } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from "@/lib/contracts";
import { useState, useEffect, useCallback } from "react";
import { useInvalidateQueries } from "./useInvalidateQueries";

// Helper to extract readable error message from contract revert
function extractErrorMessage(error: unknown): string {
    const errorStr = String(error);
    if (errorStr.includes("Invalid recipient")) return "Invalid recipient address";
    if (errorStr.includes("Amount must be greater than 0")) return "Amount must be greater than 0";
    if (errorStr.includes("End date too soon")) return "End date must be further in the future";
    if (errorStr.includes("insufficient funds")) return "Insufficient funds for deposit";
    if (errorStr.includes("execution reverted")) {
        const match = errorStr.match(/reason:\s*([^,]+)/i);
        if (match) return match[1].trim();
    }
    return "Transaction would fail. Please check your inputs and balance.";
}

export function useCreateAgent() {
    const { writeContractAsync, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const { address: userAddress } = useAccount();
    const { invalidateAll } = useInvalidateQueries();
    const [isCreating, setIsCreating] = useState(false);
    const [simulationError, setSimulationError] = useState<string | null>(null);

    // Invalidate queries when transaction succeeds
    useEffect(() => {
        if (isSuccess && isCreating) {
            console.log("Agent creation confirmed, invalidating queries...");
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

    const createAgent = useCallback(async (
        to: string,
        amount: bigint,
        token: string,
        interval: bigint,
        description: string,
        initialDeposit: bigint,
        initialTokenDeposit: bigint = 0n,
        endDate: bigint = 0n
    ): Promise<{ success: boolean; error?: string }> => {
        const config = CONTRACT_CONFIG[chainId];
        const address = config?.address;

        if (!address || address === NATIVE_TOKEN) {
            return { success: false, error: "Contract not deployed on this chain" };
        }

        if (!publicClient || !userAddress) {
            return { success: false, error: "Wallet not connected" };
        }

        setIsCreating(true);
        setSimulationError(null);

        // Step 1: Simulate the transaction
        try {
            await publicClient.simulateContract({
                address: address,
                abi: AGENT_PAY_ABI,
                functionName: "createScheduledPayment",
                args: [to as `0x${string}`, amount, token as `0x${string}`, interval, description, initialTokenDeposit, endDate],
                value: initialDeposit,
                account: userAddress,
            });
        } catch (simError) {
            const errorMsg = extractErrorMessage(simError);
            console.error("Simulation failed:", simError);
            setSimulationError(errorMsg);
            setIsCreating(false);
            return { success: false, error: errorMsg };
        }

        // Step 2: Proceed with transaction
        try {
            await writeContractAsync({
                address: address,
                abi: AGENT_PAY_ABI,
                functionName: "createScheduledPayment",
                args: [to as `0x${string}`, amount, token as `0x${string}`, interval, description, initialTokenDeposit, endDate],
                value: initialDeposit,
            });
            return { success: true };
        } catch (e) {
            console.error("Create agent error:", e);
            setIsCreating(false);
            return { success: false, error: extractErrorMessage(e) };
        }
    }, [chainId, writeContractAsync, publicClient, userAddress]);

    const resetState = useCallback(() => {
        reset();
        setIsCreating(false);
        setSimulationError(null);
    }, [reset]);

    return {
        createAgent,
        hash,
        isPending: isWritePending || isConfirming || isCreating,
        isSuccess,
        error: writeError || receiptError,
        simulationError,
        resetState
    };
}
