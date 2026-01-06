"use client";

import { useReadContract, useBalance } from "wagmi";
import { AGENT_PAY_ABI, AGENT_PAY_ADDRESS, UserStats } from "@/lib/contracts";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

// Cache configuration to prevent excessive refetching
const QUERY_CONFIG = {
    staleTime: 30_000, // Data considered fresh for 30 seconds
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when tab regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
};

export function useUserStats() {
    const { address } = useAccount();

    const { data: balance } = useBalance({
        address: address,
        query: QUERY_CONFIG
    });

    const { data: statsData, isLoading, refetch } = useReadContract({
        address: AGENT_PAY_ADDRESS,
        abi: AGENT_PAY_ABI,
        functionName: "getUserStats",
        args: address ? [address] : undefined,
        query: { enabled: !!address, ...QUERY_CONFIG }
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
