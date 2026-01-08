"use client";

import { ScheduledPayment, NATIVE_TOKEN, SUPPORTED_TOKENS, CONTRACT_CONFIG } from "@/lib/contracts"; // Added CONTRACT_CONFIG
import { formatEther, formatUnits, parseUnits } from "viem";
import { formatId } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, RefreshCw, Trash2, Wallet, Plus, Loader2, Pause, Play, Coins, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ClientDate } from "@/components/ClientDate";
import { useState } from "react";
import { useTopUpAgent } from "@/hooks/useTopUpAgent";
import { useDeleteAgent } from "@/hooks/useDeleteAgent";
import { useToggleAgentStatus } from "@/hooks/useToggleAgentStatus";
import { useChainId } from "wagmi"; // Added useChainId
import { useTokenApproval } from "@/hooks/useTokenApproval"; // Added useTokenApproval
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AgentCardProps {
    agent: ScheduledPayment;
    onUpdate: () => void;
    totalSent?: bigint;
}

export function AgentCard({ agent, onUpdate, totalSent = 0n }: AgentCardProps) {
    const { topUpAgent, isPending: isTopUpPending } = useTopUpAgent();
    const { deleteAgent, isPending: isDeletePending } = useDeleteAgent();
    const { toggleAgentStatus, isPending: isTogglePending } = useToggleAgentStatus();
    const chainId = useChainId();

    const [topUpAmount, setTopUpAmount] = useState("");
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);

    const tokenInfo = SUPPORTED_TOKENS.find(t => t.address === agent.token);
    const symbol = tokenInfo?.symbol || (agent.token === NATIVE_TOKEN ? "MNT" : "Tokens");
    const decimals = tokenInfo?.decimals || 18;
    const isNative = agent.token === NATIVE_TOKEN;

    // Token Approval for Top Up
    const config = CONTRACT_CONFIG[chainId];
    const contractAddress = config?.address;

    // We only need approval if it's ERC20
    const { allowance, approveToken, isPending: isApprovePending } = useTokenApproval(
        agent.token as `0x${string}`,
        contractAddress
    );

    const topUpAmountBigInt = topUpAmount ? parseUnits(topUpAmount, decimals) : 0n;
    const needsApproval = !isNative && topUpAmountBigInt > 0n && allowance < topUpAmountBigInt;

    const handleTopUp = async () => {
        if (!topUpAmount) return;
        try {
            if (isNative) {
                await topUpAgent(agent.id, parseUnits(topUpAmount, 18), 0n);
            } else {
                await topUpAgent(agent.id, 0n, parseUnits(topUpAmount, decimals));
            }

            setIsTopUpOpen(false);
            setTopUpAmount("");
            // Wait for confirmation
            setTimeout(onUpdate, 2000);
        } catch (e) {
            console.error(e);
        }
    };

    const handleApprove = async () => {
        if (topUpAmountBigInt > 0n) {
            await approveToken(topUpAmountBigInt);
        }
    };

    const handleToggleStatus = async () => {
        try {
            await toggleAgentStatus(agent.id, !agent.isActive);
            // Wait for confirmation
            setTimeout(onUpdate, 2000);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure? This will delete the agent and refund all remaining funds to your wallet.")) {
            try {
                await deleteAgent(agent.id);
                setTimeout(onUpdate, 2000);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const formatInterval = (seconds: bigint) => {
        const mins = Number(seconds) / 60;
        if (mins < 60) return `${mins} mins`;
        const hours = mins / 60;
        if (hours < 24) return `${hours} hours`;
        return `${hours / 24} days`;
    };

    const displayBalance = isNative ? agent.balance : agent.tokenBalance;

    return (
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 p-4">
                <Badge variant={agent.isActive ? "default" : "secondary"}>
                    {agent.isActive ? "Active" : "Paused"}
                </Badge>
            </div>

            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {isNative ? <Bot className="size-6 text-primary" /> : <Coins className="size-6 text-blue-500" />}
                    </div>
                    <div>
                        <CardTitle>{agent.description || "Unnamed Agent"}</CardTitle>
                        <CardDescription>
                            {formatId(agent.id)} • {symbol} Agent
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Wallet className="size-4" />
                            Balance
                        </span>
                        <span className="text-lg font-bold">
                            {formatUnits(displayBalance || 0n, decimals)} {symbol}
                        </span>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-500">Total Paid</span>
                        <span className="font-bold text-green-600">{formatUnits(totalSent, decimals)} {symbol}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Payment Amount</span>
                        <span className="font-medium">{formatUnits(agent.amount, decimals)} {symbol}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Frequency</span>
                        <span className="font-medium flex items-center gap-1">
                            <RefreshCw className="size-3" />
                            Every {formatInterval(agent.interval)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Next Payment</span>
                        <span className="font-medium text-xs">
                            <ClientDate timestamp={Number(agent.nextExecution)} />
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="gap-2">
                <Button className="flex-1" variant="secondary" asChild>
                    <Link href={`/agents/${agent.id}`}>
                        View Details
                    </Link>
                </Button>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleToggleStatus}
                                disabled={isTogglePending}
                            >
                                {isTogglePending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : agent.isActive ? (
                                    <Pause className="size-4" />
                                ) : (
                                    <Play className="size-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{agent.isActive ? "Pause Agent" : "Resume Agent"}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                    <DialogTrigger asChild>
                        <div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <Plus className="size-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Top Up Agent Balance</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Top Up Agent</DialogTitle>
                            <DialogDescription>
                                Add {symbol} to this agent's balance.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount ({symbol})</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.0"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            {needsApproval ? (
                                <Button onClick={handleApprove} disabled={isApprovePending}>
                                    {isApprovePending && <Loader2 className="size-4 mr-2 animate-spin" />}
                                    Approve {symbol}
                                </Button>
                            ) : (
                                <Button onClick={handleTopUp} disabled={isTopUpPending || !topUpAmount}>
                                    {isTopUpPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                                    Confirm Top Up
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isDeletePending}
                >
                    {isDeletePending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </Button>
            </CardFooter>
        </Card>
    );
}
