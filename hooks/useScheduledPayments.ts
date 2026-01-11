"use client";

import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN, ScheduledPayment } from "@/lib/contracts";
import { useAccount } from "wagmi";
import { parseEther } from "viem";

// Cache configuration to prevent excessive refetching
const QUERY_CONFIG = {
    staleTime: 30_000, // Data considered fresh for 30 seconds
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when tab regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
};

export function useScheduledPayments() {
    const { address } = useAccount();
    const chainId = useChainId();
    const config = CONTRACT_CONFIG[chainId];
    const contractAddress = config?.address;
    const isContractAvailable = contractAddress && contractAddress !== NATIVE_TOKEN;

    const { data: paymentIds, isLoading: loadingIds, refetch: refetchIds } = useReadContract({
        address: contractAddress,
        abi: AGENT_PAY_ABI,
        functionName: "getUserScheduledPayments",
        args: address ? [address] : undefined,
        query: { enabled: !!address && !!isContractAvailable, ...QUERY_CONFIG }
    });

    const paymentQueries = (paymentIds || []).map((id) => ({
        address: contractAddress!,
        abi: AGENT_PAY_ABI,
        functionName: "getScheduledPayment" as const,
        args: [id] as const
    }));

    const { data: paymentsData, isLoading: loadingPayments, refetch: refetchPayments } = useReadContracts({
        contracts: paymentQueries,
        query: { enabled: (paymentIds?.length || 0) > 0 && !!isContractAvailable, ...QUERY_CONFIG }
    });

    const payments: ScheduledPayment[] = paymentsData
        ?.filter((r) => r.status === "success" && r.result)
        .map((r) => r.result as ScheduledPayment) || [];

    const refetch = () => {
        if (isContractAvailable) {
            refetchIds();
            refetchPayments();
        }
    };

    return {
        payments,
        activePayments: payments.filter(p => p.isActive),
        isLoading: loadingIds || loadingPayments,
        refetch
    };
}

export function useCreateScheduledPayment() {
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();

    const createScheduledPayment = async (
        to: string,
        amount: string,
        token: string,
        intervalSeconds: number,
        description: string,
        endDate: bigint = 0n
    ) => {
        const config = CONTRACT_CONFIG[chainId];
        if (!config?.address) throw new Error("Contract not deployed on this chain");

        const tokenAddr = token === "MNT" || token === "Native" || token === ""
            ? "0x0000000000000000000000000000000000000000"
            : token;
        const amountWei = parseEther(amount);

        writeContract({
            address: config.address,
            abi: AGENT_PAY_ABI,
            functionName: "createScheduledPayment",
            args: [
                to as `0x${string}`,
                amountWei,
                tokenAddr as `0x${string}`,
                BigInt(intervalSeconds),
                description,
                0n, // initialTokenDeposit
                endDate
            ],
            value: tokenAddr === "0x0000000000000000000000000000000000000000" ? amountWei : 0n
        });
    };

    return {
        createScheduledPayment,
        hash,
        isPending: isWritePending || isConfirming,
        isSuccess,
        error: writeError
    };
}

export function useCancelScheduledPayment() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();

    const cancelPayment = async (id: bigint) => {
        const config = CONTRACT_CONFIG[chainId];
        if (!config?.address) throw new Error("Contract not deployed on this chain");

        writeContract({
            address: config.address,
            abi: AGENT_PAY_ABI,
            functionName: "cancelScheduledPayment",
            args: [id]
        });
    };

    return {
        cancelPayment,
        isPending: isPending || isConfirming,
        isSuccess,
        error
    };
}

export function useExecuteScheduledPayment() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const chainId = useChainId();

    const executePayment = async (id: bigint) => {
        const config = CONTRACT_CONFIG[chainId];
        if (!config?.address) throw new Error("Contract not deployed on this chain");

        writeContract({
            address: config.address,
            abi: AGENT_PAY_ABI,
            functionName: "executeScheduledPayment",
            args: [id]
        });
    };

    return {
        executePayment,
        isPending: isPending || isConfirming,
        isSuccess,
        error
    };
}
