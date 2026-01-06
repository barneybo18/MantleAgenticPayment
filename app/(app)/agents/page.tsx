"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, Plus, Play, Pause, Loader2, Clock } from "lucide-react";
import { useScheduledPayments, useCreateScheduledPayment, useCancelScheduledPayment, useExecuteScheduledPayment } from "@/hooks/useScheduledPayments";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { useState } from "react";
import { AgentCardsGridSkeleton } from "@/components/AgentCardSkeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentsPage() {
    const { isConnected } = useAccount();
    const { payments, activePayments, isLoading, refetch } = useScheduledPayments();
    const { createScheduledPayment, isPending: creating } = useCreateScheduledPayment();
    const { cancelPayment, isPending: cancelling } = useCancelScheduledPayment();
    const { executePayment, isPending: executing } = useExecuteScheduledPayment();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [interval, setInterval] = useState("604800"); // 1 week in seconds
    const [description, setDescription] = useState("");

    const handleCreate = async () => {
        if (!recipient || !amount) return;
        try {
            await createScheduledPayment(recipient, amount, "MNT", parseInt(interval), description);
            setDialogOpen(false);
            setRecipient("");
            setAmount("");
            setDescription("");
            setTimeout(() => refetch(), 2000);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCancel = async (id: bigint) => {
        try {
            await cancelPayment(id);
            setTimeout(() => refetch(), 2000);
        } catch (e) {
            console.error(e);
        }
    };

    const handleExecute = async (id: bigint) => {
        try {
            await executePayment(id);
            setTimeout(() => refetch(), 2000);
        } catch (e) {
            console.error(e);
        }
    };

    const formatInterval = (seconds: bigint) => {
        const secs = Number(seconds);
        if (secs < 3600) return `${Math.floor(secs / 60)} minutes`;
        if (secs < 86400) return `${Math.floor(secs / 3600)} hours`;
        if (secs < 604800) return `${Math.floor(secs / 86400)} days`;
        return `${Math.floor(secs / 604800)} weeks`;
    };

    const getNextExecutionStatus = (nextExecution: bigint) => {
        const now = Math.floor(Date.now() / 1000);
        const next = Number(nextExecution);
        if (next <= now) return { text: "Ready to execute", canExecute: true };
        const diff = next - now;
        if (diff < 3600) return { text: `in ${Math.floor(diff / 60)} min`, canExecute: false };
        if (diff < 86400) return { text: `in ${Math.floor(diff / 3600)} hours`, canExecute: false };
        return { text: `in ${Math.floor(diff / 86400)} days`, canExecute: false };
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Agent Payments</h2>
                    <p className="text-muted-foreground">Connect your wallet to manage automated payments</p>
                </div>
                <ConnectButton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Agents</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Agent
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Scheduled Payment</DialogTitle>
                            <DialogDescription>
                                Set up an automated recurring payment agent.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Recipient Address</Label>
                                <Input placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Amount (MNT)</Label>
                                    <Input type="number" placeholder="0.1" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Interval</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={interval}
                                        onChange={(e) => setInterval(e.target.value)}
                                    >
                                        <option value="60">Every Minute (Test)</option>
                                        <option value="3600">Every Hour</option>
                                        <option value="86400">Daily</option>
                                        <option value="604800">Weekly</option>
                                        <option value="2592000">Monthly</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input placeholder="e.g., Payroll, Subscription" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={creating || !recipient || !amount}>
                                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create & Fund'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <AgentCardsGridSkeleton />
                    </motion.div>
                ) : payments.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 border rounded-lg"
                    >
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground mb-4">No scheduled payments yet</p>
                        <Button onClick={() => setDialogOpen(true)}>Create your first agent</Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {payments.map((payment, idx) => {
                            const nextStatus = getNextExecutionStatus(payment.nextExecution);
                            return (
                                <motion.div
                                    key={payment.id.toString()}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="relative overflow-hidden">
                                        <div className={`absolute inset-0 ${payment.isActive ? 'bg-linear-to-br from-purple-500/5 to-transparent' : 'bg-muted/20'}`} />
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Bot className="size-5" /> Agent #{payment.id.toString()}
                                                </CardTitle>
                                                <Badge variant={payment.isActive ? "default" : "secondary"}>
                                                    {payment.isActive ? 'Active' : 'Paused'}
                                                </Badge>
                                            </div>
                                            <CardDescription>{payment.description || 'Scheduled Payment'}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">To:</span>
                                                    <span className="font-mono text-xs">{payment.to.slice(0, 8)}...{payment.to.slice(-6)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Amount:</span>
                                                    <span className="font-medium">{formatEther(payment.amount)} MNT</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Interval:</span>
                                                    <span>{formatInterval(payment.interval)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">Next:</span>
                                                    <span className={`flex items-center gap-1 ${nextStatus.canExecute ? 'text-green-500' : ''}`}>
                                                        <Clock className="size-3" /> {nextStatus.text}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="justify-between">
                                            {payment.isActive ? (
                                                <>
                                                    {nextStatus.canExecute && (
                                                        <Button size="sm" onClick={() => handleExecute(payment.id)} disabled={executing}>
                                                            {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="mr-1 size-3" /> Execute</>}
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm" onClick={() => handleCancel(payment.id)} disabled={cancelling}>
                                                        {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Pause className="mr-1 size-3" /> Pause</>}
                                                    </Button>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Cancelled</span>
                                            )}
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
