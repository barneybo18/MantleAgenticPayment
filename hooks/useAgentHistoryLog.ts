"use client";

import { usePublicClient, useChainId, useAccount } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { AGENT_PAY_ABI, CONTRACT_CONFIG, NATIVE_TOKEN, ScheduledPayment } from '@/lib/contracts';

// Max block range for Mantle RPC
const MAX_BLOCK_RANGE = 9000n;

export type AgentEventType = 'created' | 'executed' | 'cancelled' | 'paused' | 'resumed' | 'topup' | 'withdrawn';

export interface AgentHistoryEvent {
    type: AgentEventType;
    agentId: bigint;
    transactionHash: string;
    blockNumber: bigint;
    timestamp: bigint;
    // Additional data depending on event type
    amount?: bigint;
    to?: string;
    from?: string;
    description?: string;
    interval?: bigint;
    token?: string;
    isActive?: boolean;
}

export interface ArchivedAgent {
    id: bigint;
    description: string;
    from: string;
    to: string;
    amount: bigint;
    token: string;
    interval: bigint;
    createdAt: bigint;
    terminatedAt?: bigint;
    terminationReason: 'completed' | 'deleted' | 'active';
    totalExecutions: number;
    totalPaid: bigint;
    events: AgentHistoryEvent[];
}

export function useAgentHistoryLog() {
    const publicClient = usePublicClient();
    const chainId = useChainId();
    const { address: userAddress } = useAccount();
    const [history, setHistory] = useState<AgentHistoryEvent[]>([]);
    const [archivedAgents, setArchivedAgents] = useState<ArchivedAgent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        const config = CONTRACT_CONFIG[chainId];
        if (!publicClient || !config || config.address === NATIVE_TOKEN || !userAddress) {
            setHistory([]);
            setArchivedAgents([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const currentBlock = await publicClient.getBlockNumber();
            const allEvents: AgentHistoryEvent[] = [];
            const agentMap = new Map<string, ArchivedAgent>();

            let fromBlock = config.deployBlock;

            while (fromBlock <= currentBlock) {
                const toBlock = fromBlock + MAX_BLOCK_RANGE > currentBlock
                    ? currentBlock
                    : fromBlock + MAX_BLOCK_RANGE;

                try {
                    // Fetch all relevant events in parallel for this block range
                    const [createdLogs, executedLogs, cancelledLogs, statusLogs, topupLogs, withdrawnLogs] = await Promise.all([
                        publicClient.getContractEvents({
                            address: config.address,
                            abi: AGENT_PAY_ABI,
                            eventName: 'ScheduledPaymentCreated',
                            args: { from: userAddress },
                            fromBlock,
                            toBlock
                        }),
                        publicClient.getContractEvents({
                            address: config.address,
                            abi: AGENT_PAY_ABI,
                            eventName: 'ScheduledPaymentExecuted',
                            args: { from: userAddress },
                            fromBlock,
                            toBlock
                        }),
                        publicClient.getContractEvents({
                            address: config.address,
                            abi: AGENT_PAY_ABI,
                            eventName: 'ScheduledPaymentCancelled',
                            fromBlock,
                            toBlock
                        }),
                        publicClient.getContractEvents({
                            address: config.address,
                            abi: AGENT_PAY_ABI,
                            eventName: 'AgentStatusUpdated',
                            fromBlock,
                            toBlock
                        }),
                        publicClient.getContractEvents({
                            address: config.address,
                            abi: AGENT_PAY_ABI,
                            eventName: 'AgentTopUp',
                            fromBlock,
                            toBlock
                        }),
                        publicClient.getContractEvents({
                            address: config.address,
                            abi: AGENT_PAY_ABI,
                            eventName: 'AgentWithdrawn',
                            fromBlock,
                            toBlock
                        })
                    ]);

                    // Process Created events
                    for (const log of createdLogs) {
                        const agentId = log.args.id as bigint;
                        const event: AgentHistoryEvent = {
                            type: 'created',
                            agentId,
                            transactionHash: log.transactionHash,
                            blockNumber: log.blockNumber,
                            timestamp: 0n, // Will be filled later
                            from: log.args.from as string,
                            to: log.args.to as string,
                            amount: log.args.amount as bigint,
                            interval: log.args.interval as bigint
                        };
                        allEvents.push(event);

                        // Initialize agent in map
                        if (!agentMap.has(agentId.toString())) {
                            agentMap.set(agentId.toString(), {
                                id: agentId,
                                description: '',
                                from: log.args.from as string,
                                to: log.args.to as string,
                                amount: log.args.amount as bigint,
                                token: NATIVE_TOKEN,
                                interval: log.args.interval as bigint,
                                createdAt: 0n,
                                terminationReason: 'active',
                                totalExecutions: 0,
                                totalPaid: 0n,
                                events: []
                            });
                        }
                    }

                    // Process Executed events
                    for (const log of executedLogs) {
                        const agentId = log.args.id as bigint;
                        const event: AgentHistoryEvent = {
                            type: 'executed',
                            agentId,
                            transactionHash: log.transactionHash,
                            blockNumber: log.blockNumber,
                            timestamp: 0n,
                            amount: log.args.amount as bigint,
                            to: log.args.to as string,
                            from: log.args.from as string
                        };
                        allEvents.push(event);

                        // Update agent stats
                        const agent = agentMap.get(agentId.toString());
                        if (agent) {
                            agent.totalExecutions++;
                            agent.totalPaid += log.args.amount as bigint;
                        }
                    }

                    // Process Cancelled events
                    for (const log of cancelledLogs) {
                        const agentId = log.args.id as bigint;
                        // Check if this agent belongs to user
                        const agent = agentMap.get(agentId.toString());
                        if (agent) {
                            const event: AgentHistoryEvent = {
                                type: 'cancelled',
                                agentId,
                                transactionHash: log.transactionHash,
                                blockNumber: log.blockNumber,
                                timestamp: 0n
                            };
                            allEvents.push(event);
                            agent.terminationReason = 'deleted';
                        }
                    }

                    // Process Status Update events
                    for (const log of statusLogs) {
                        const agentId = log.args.id as bigint;
                        const agent = agentMap.get(agentId.toString());
                        if (agent) {
                            const isActive = log.args.isActive as boolean;
                            const event: AgentHistoryEvent = {
                                type: isActive ? 'resumed' : 'paused',
                                agentId,
                                transactionHash: log.transactionHash,
                                blockNumber: log.blockNumber,
                                timestamp: 0n,
                                isActive
                            };
                            allEvents.push(event);
                        }
                    }

                    // Process TopUp events
                    for (const log of topupLogs) {
                        const agentId = log.args.id as bigint;
                        const agent = agentMap.get(agentId.toString());
                        if (agent) {
                            const event: AgentHistoryEvent = {
                                type: 'topup',
                                agentId,
                                transactionHash: log.transactionHash,
                                blockNumber: log.blockNumber,
                                timestamp: 0n,
                                amount: log.args.amount as bigint
                            };
                            allEvents.push(event);
                        }
                    }

                    // Process Withdrawn events
                    for (const log of withdrawnLogs) {
                        const agentId = log.args.id as bigint;
                        const agent = agentMap.get(agentId.toString());
                        if (agent) {
                            const event: AgentHistoryEvent = {
                                type: 'withdrawn',
                                agentId,
                                transactionHash: log.transactionHash,
                                blockNumber: log.blockNumber,
                                timestamp: 0n,
                                amount: log.args.amount as bigint
                            };
                            allEvents.push(event);
                        }
                    }

                } catch (chunkError) {
                    console.warn(`Failed to fetch logs for blocks ${fromBlock}-${toBlock}:`, chunkError);
                }

                fromBlock = toBlock + 1n;
            }

            // Fetch timestamps for all unique blocks
            const uniqueBlockNumbers = Array.from(new Set(allEvents.map(e => e.blockNumber)));
            const blockPromises = uniqueBlockNumbers.map(bn => publicClient.getBlock({ blockNumber: bn }));
            const blocks = await Promise.all(blockPromises);
            const blockMap = new Map(blocks.map(b => [b.number, b.timestamp]));

            // Update timestamps
            for (const event of allEvents) {
                event.timestamp = blockMap.get(event.blockNumber) || 0n;
            }

            // Fetch agent details for descriptions and tokens
            const agentIds = Array.from(agentMap.keys());
            for (const agentIdStr of agentIds) {
                try {
                    const agentData = await publicClient.readContract({
                        address: config.address,
                        abi: AGENT_PAY_ABI,
                        functionName: 'getScheduledPayment',
                        args: [BigInt(agentIdStr)]
                    }) as ScheduledPayment;

                    const agent = agentMap.get(agentIdStr);
                    if (agent && agentData) {
                        agent.description = agentData.description || `Agent #${agentIdStr}`;
                        agent.token = agentData.token;
                        agent.to = agentData.to;
                        agent.amount = agentData.amount;

                        // Determine termination reason if not already deleted
                        if (agent.terminationReason !== 'deleted') {
                            const now = BigInt(Math.floor(Date.now() / 1000));
                            if (!agentData.isActive && agentData.endDate > 0n && now >= agentData.endDate) {
                                agent.terminationReason = 'completed';
                                agent.terminatedAt = agentData.endDate;
                            } else if (!agentData.isActive && agentData.balance === 0n && agentData.tokenBalance === 0n) {
                                agent.terminationReason = 'deleted';
                            } else {
                                agent.terminationReason = 'active';
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to fetch agent ${agentIdStr} details:`, e);
                }
            }

            // Set created timestamps and assign events
            for (const event of allEvents) {
                const agent = agentMap.get(event.agentId.toString());
                if (agent) {
                    if (event.type === 'created') {
                        agent.createdAt = event.timestamp;
                    }
                    if (event.type === 'cancelled') {
                        agent.terminatedAt = event.timestamp;
                    }
                    agent.events.push(event);
                }
            }

            // Sort events by timestamp descending
            allEvents.sort((a, b) => Number(b.timestamp - a.timestamp));

            // Sort archived agents by creation date descending
            const archivedList = Array.from(agentMap.values());
            archivedList.sort((a, b) => Number(b.createdAt - a.createdAt));

            // Sort events within each agent
            for (const agent of archivedList) {
                agent.events.sort((a, b) => Number(b.timestamp - a.timestamp));
            }

            setHistory(allEvents);
            setArchivedAgents(archivedList);

        } catch (e) {
            console.error("Failed to fetch agent history:", e);
            setError("Failed to load agent history. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [publicClient, chainId, userAddress]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        history,
        archivedAgents,
        isLoading,
        error,
        refetch: fetchHistory
    };
}
