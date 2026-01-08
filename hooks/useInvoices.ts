"use client";

import { useReadContract, useReadContracts, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, Invoice, NATIVE_TOKEN } from "@/lib/contracts";
import { useAccount } from "wagmi";

// Cache configuration to prevent excessive refetching
const QUERY_CONFIG = {
    staleTime: 30_000, // Data considered fresh for 30 seconds
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when tab regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
};

export function useInvoices() {
    const { address } = useAccount();
    const chainId = useChainId();
    const config = CONTRACT_CONFIG[chainId];
    const contractAddress = config?.address;
    const isContractAvailable = contractAddress && contractAddress !== NATIVE_TOKEN;

    // Get invoice IDs created by user
    const { data: createdIds, isLoading: loadingCreated, refetch: refetchCreated } = useReadContract({
        address: contractAddress,
        abi: AGENT_PAY_ABI,
        functionName: "getUserCreatedInvoices",
        args: address ? [address] : undefined,
        query: { enabled: !!address && !!isContractAvailable, ...QUERY_CONFIG }
    });

    // Get invoice IDs received by user
    const { data: receivedIds, isLoading: loadingReceived, refetch: refetchReceived } = useReadContract({
        address: contractAddress,
        abi: AGENT_PAY_ABI,
        functionName: "getUserReceivedInvoices",
        args: address ? [address] : undefined,
        query: { enabled: !!address && !!isContractAvailable, ...QUERY_CONFIG }
    });

    // Combine all unique IDs
    const allIds = [...new Set([
        ...(createdIds || []),
        ...(receivedIds || [])
    ])];

    // Fetch details for each invoice
    const invoiceQueries = allIds.map((id) => ({
        address: contractAddress!,
        abi: AGENT_PAY_ABI,
        functionName: "getInvoice" as const,
        args: [id] as const
    }));

    const { data: invoicesData, isLoading: loadingInvoices, refetch: refetchInvoices } = useReadContracts({
        contracts: invoiceQueries,
        query: { enabled: allIds.length > 0 && !!isContractAvailable, ...QUERY_CONFIG }
    });

    const invoices: Invoice[] = invoicesData
        ?.filter((r) => r.status === "success" && r.result)
        .map((r) => r.result as Invoice) || [];

    const refetch = () => {
        if (isContractAvailable) {
            refetchCreated();
            refetchReceived();
            refetchInvoices();
        }
    };

    return {
        invoices,
        createdInvoices: invoices.filter((inv) => inv.creator.toLowerCase() === address?.toLowerCase()),
        receivedInvoices: invoices.filter((inv) => inv.recipient.toLowerCase() === address?.toLowerCase()),
        isLoading: loadingCreated || loadingReceived || loadingInvoices,
        refetch
    };
}

export function useInvoice(id: bigint | undefined) {
    const chainId = useChainId();
    const config = CONTRACT_CONFIG[chainId];
    const contractAddress = config?.address;
    const isContractAvailable = contractAddress && contractAddress !== NATIVE_TOKEN;

    const { data, isLoading, refetch } = useReadContract({
        address: contractAddress,
        abi: AGENT_PAY_ABI,
        functionName: "getInvoice",
        args: id !== undefined ? [id] : undefined,
        query: { enabled: id !== undefined && !!isContractAvailable, ...QUERY_CONFIG }
    });

    return {
        invoice: data as Invoice | undefined,
        isLoading,
        refetch
    };
}
