"use client";

import { useAgents } from "@/hooks/useAgents";
import { useAgentStats } from "@/hooks/useAgentStats";
import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Bot } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AgentsPage() {
    const { isConnected } = useAccount();
    const { agents, isLoading, refetch } = useAgents();
    const { stats, isLoading: statsLoading } = useAgentStats();

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="p-6 bg-muted/30 rounded-full">
                    <Bot className="size-16 text-muted-foreground/50" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Your AI Agents</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Connect your wallet to manage your automated payment agents.
                    </p>
                </div>
                <ConnectButton />
            </div>
        );
    }

    // Filter out cancelled/deleted agents (isActive=false AND no balance)
    const isCancelled = (a: typeof agents[0]) => !a.isActive && a.balance === 0n && a.tokenBalance === 0n;
    const visibleAgents = agents.filter(a => !isCancelled(a));

    const activeAgents = visibleAgents.filter(a => a.isActive);
    const pausedAgents = visibleAgents.filter(a => !a.isActive);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
                    <p className="text-muted-foreground mt-2">
                        Deploy autonomous agents to execute recurring payments on your behalf.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/agents/new">
                        <Plus className="mr-2 size-4" />
                        New Agent
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="all">All ({visibleAgents.length})</TabsTrigger>
                        <TabsTrigger value="active">Active ({activeAgents.length})</TabsTrigger>
                        <TabsTrigger value="paused">Paused ({pausedAgents.length})</TabsTrigger>
                    </TabsList>
                </div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Loading agents...</p>
                        </div>
                    ) : (
                        <>
                            <TabsContent value="all" className="space-y-4">
                                {visibleAgents.length === 0 ? (
                                    <div className="text-center py-12 space-y-4 border-2 border-dashed rounded-lg">
                                        <div className="p-4 bg-muted/50 rounded-full inline-block">
                                            <Bot className="size-8 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-medium">No Agents</h3>
                                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                                You haven't created any agents yet.
                                            </p>
                                        </div>
                                        <Button asChild variant="outline">
                                            <Link href="/agents/new">Create Agent</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {visibleAgents.map((agent) => (
                                            <motion.div
                                                key={agent.id.toString()}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                            >
                                                <AgentCard
                                                    agent={agent}
                                                    onUpdate={refetch}
                                                    totalSent={stats[agent.id.toString()] || 0n}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="active" className="space-y-4">
                                {activeAgents.length === 0 ? (
                                    <div className="text-center py-12 space-y-4 border-2 border-dashed rounded-lg">
                                        <div className="p-4 bg-muted/50 rounded-full inline-block">
                                            <Bot className="size-8 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-medium">No Active Agents</h3>
                                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                                You have no active agents running.
                                            </p>
                                        </div>
                                        <Button asChild variant="outline">
                                            <Link href="/agents/new">Create Agent</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {activeAgents.map((agent) => (
                                            <motion.div
                                                key={agent.id.toString()}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                            >
                                                <AgentCard
                                                    agent={agent}
                                                    onUpdate={refetch}
                                                    totalSent={stats[agent.id.toString()] || 0n}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="paused" className="space-y-4">
                                {pausedAgents.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">No paused agents.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {pausedAgents.map((agent) => (
                                            <motion.div
                                                key={agent.id.toString()}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                            >
                                                <AgentCard
                                                    agent={agent}
                                                    onUpdate={refetch}
                                                    totalSent={stats[agent.id.toString()] || 0n}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </>
                    )}
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
