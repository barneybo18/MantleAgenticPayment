import { useAccount, usePublicClient, useChainId } from 'wagmi';
import { useState, useEffect } from 'react';
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN } from '@/lib/contracts';

export function useAgentStats() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const chainId = useChainId();
    const [stats, setStats] = useState<Record<string, bigint>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const config = CONTRACT_CONFIG[chainId];
        if (!address || !publicClient || !config || config.address === NATIVE_TOKEN) return;

        const fetchStats = async () => {
            setIsLoading(true);
            try {
                // Fetch all executions by this user
                const logs = await publicClient.getContractEvents({
                    address: config.address,
                    abi: AGENT_PAY_ABI,
                    eventName: 'ScheduledPaymentExecuted',
                    args: { from: address },
                    fromBlock: config.deployBlock
                });

                const newStats: Record<string, bigint> = {};

                for (const log of logs) {
                    const id = log.args.id?.toString();
                    const amount = log.args.amount as bigint;

                    if (id && amount) {
                        newStats[id] = (newStats[id] || 0n) + amount;
                    }
                }

                setStats(newStats);
            } catch (e) {
                console.error("Failed to fetch agent stats:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [address, publicClient]);

    return { stats, isLoading };
}
