"use client";

import { useReadContract, useBalance, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN, UserStats } from "@/lib/contracts";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

const QUERY_CONFIG = {
    staleTime: 30_000, 
    gcTime: 5 * 60_000, 
    refetchOnWindowFocus: false, 
    refetchOnMount: false, 
    refetchOnReconnect: false,
};

export function useUserStats() {
    const { address } = useAccount();
    const chainId = useChainId();
    const config = CONTRACT_CONFIG[chainId];
    const contractAddress = config?.address;
    const isContractAvailable = contractAddress && contractAddress !== NATIVE_TOKEN;

    const { data: balance } = useBalance({
        address: address,
        query: QUERY_CONFIG
    });

    const { data: statsData, isLoading, refetch } = useReadContract({
        address: contractAddress,
        abi: AGENT_PAY_ABI,
        functionName: "getUserStats",
        args: address ? [address] : undefined,
        query: { enabled: !!address && !!isContractAvailable, ...QUERY_CONFIG }
    });

    const stats: UserStats | undefined = statsData ? {
        createdCount: statsData[0],
        receivedCount: statsData[1],
        totalPaid: statsData[2],
        totalReceived: statsData[3],
        scheduledCount: statsData[4]
    } : undefined;

    return {
        balance: balance ? formatEther(balance.value) : "0",
        balanceFormatted: balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}` : "0 MNT",
        stats,
        totalPaidFormatted: stats ? `${formatEther(stats.totalPaid)} MNT` : "0 MNT",
        totalReceivedFormatted: stats ? `${formatEther(stats.totalReceived)} MNT` : "0 MNT",
        invoiceCount: stats ? Number(stats.createdCount) + Number(stats.receivedCount) : 0,
        scheduledCount: stats ? Number(stats.scheduledCount) : 0,
        isLoading,
        refetch
    };
}
