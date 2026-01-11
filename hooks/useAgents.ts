"use client";

import { useReadContract, useReadContracts, useWatchContractEvent, useChainId } from "wagmi";
import { AGENT_PAY_ABI, CONTRACT_CONFIG, ScheduledPayment, NATIVE_TOKEN } from "@/lib/contracts";
import { useAccount } from "wagmi";

// Cache configuration
const QUERY_CONFIG = {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
};

export function useAgents() {
    const { address: userAddress } = useAccount();
    const chainId = useChainId();
    const config = CONTRACT_CONFIG[chainId];
    const contractAddress = config?.address;
    const isContractAvailable = contractAddress && contractAddress !== NATIVE_TOKEN;

    // Get scheduled payment IDs created by user
    const { data: agentIds, isLoading: loadingIds, refetch: refetchIds } = useReadContract({
        address: contractAddress,
        abi: AGENT_PAY_ABI,
        functionName: "getUserScheduledPayments",
        args: userAddress ? [userAddress] : undefined,
        query: { enabled: !!userAddress && !!isContractAvailable, ...QUERY_CONFIG }
    });

    // Fetch details for each agent
    const agentQueries = (agentIds || []).map((id) => ({
        address: contractAddress!,
        abi: AGENT_PAY_ABI,
        functionName: "getScheduledPayment" as const,
        args: [id] as const
    }));

    const { data: agentsData, isLoading: loadingAgents, refetch: refetchAgents } = useReadContracts({
        contracts: agentQueries,
        query: { enabled: (agentIds?.length ?? 0) > 0 && !!isContractAvailable, ...QUERY_CONFIG }
    });

    const agents: ScheduledPayment[] = agentsData
        ?.filter((r) => r.status === "success" && r.result)
        .map((r) => r.result as ScheduledPayment) || [];

    const refetch = () => {
        if (isContractAvailable) {
            refetchIds();
            refetchAgents();
        }
    };

    // Real-time event listeners (only watch if valid address)
    useWatchContractEvent({
        address: isContractAvailable ? contractAddress : undefined,
        abi: AGENT_PAY_ABI,
        eventName: 'AgentTopUp',
        onLogs: () => { console.log('TopUp detected'); refetch(); },
        enabled: isContractAvailable
    });

    useWatchContractEvent({
        address: isContractAvailable ? contractAddress : undefined,
        abi: AGENT_PAY_ABI,
        eventName: 'AgentWithdrawn',
        onLogs: () => { console.log('Withdraw detected'); refetch(); },
        enabled: isContractAvailable
    });

    useWatchContractEvent({
        address: isContractAvailable ? contractAddress : undefined,
        abi: AGENT_PAY_ABI,
        eventName: 'ScheduledPaymentExecuted',
        onLogs: () => { console.log('Execution detected'); refetch(); },
        enabled: isContractAvailable
    });

    useWatchContractEvent({
        address: isContractAvailable ? contractAddress : undefined,
        abi: AGENT_PAY_ABI,
        eventName: 'ScheduledPaymentCancelled',
        onLogs: () => { console.log('Cancellation/Delete detected'); refetch(); },
        enabled: isContractAvailable
    });

    useWatchContractEvent({
        address: isContractAvailable ? contractAddress : undefined,
        abi: AGENT_PAY_ABI,
        eventName: 'AgentStatusUpdated',
        onLogs: () => { console.log('Status update detected'); refetch(); },
        enabled: isContractAvailable
    });

    useWatchContractEvent({
        address: isContractAvailable ? contractAddress : undefined,
        abi: AGENT_PAY_ABI,
        eventName: 'ScheduledPaymentCreated',
        onLogs: () => { console.log('Agent Created detected'); refetch(); },
        enabled: isContractAvailable
    });

    useWatchContractEvent({
        address: isContractAvailable ? contractAddress : undefined,
        abi: AGENT_PAY_ABI,
        eventName: 'ScheduledPaymentUpdated',
        onLogs: () => { console.log('Agent Update detected'); refetch(); },
        enabled: isContractAvailable
    });

    return {
        agents,
        isLoading: loadingIds || loadingAgents,
        refetch
    };
}

export function useAgent(id: bigint | undefined) {
    const chainId = useChainId();
    const config = CONTRACT_CONFIG[chainId];
    const contractAddress = config?.address;
    const isContractAvailable = contractAddress && contractAddress !== NATIVE_TOKEN;

    const { data: agentData, isLoading, refetch } = useReadContract({
        address: contractAddress,
        abi: AGENT_PAY_ABI,
        functionName: "getScheduledPayment",
        args: id !== undefined ? [id] : undefined,
        query: { enabled: id !== undefined && !!isContractAvailable, ...QUERY_CONFIG }
    });

    const watchEvents = (eventName: string, args?: any) => {
        useWatchContractEvent({
            address: isContractAvailable ? contractAddress : undefined,
            abi: AGENT_PAY_ABI,
            eventName: eventName as any,
            args,
            onLogs: () => refetch(),
            enabled: isContractAvailable
        });
    };

    watchEvents('AgentTopUp', id !== undefined ? { id } : undefined);
    watchEvents('AgentWithdrawn', id !== undefined ? { id } : undefined);
    watchEvents('ScheduledPaymentExecuted', id !== undefined ? { id } : undefined);
    watchEvents('AgentStatusUpdated', id !== undefined ? { id } : undefined);

    return {
        agent: agentData as ScheduledPayment | undefined,
        isLoading,
        refetch
    };
}
