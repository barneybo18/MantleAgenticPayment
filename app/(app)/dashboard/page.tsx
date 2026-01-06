"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, FileText, Bot, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUserStats } from "@/hooks/useUserStats";
import { useInvoices } from "@/hooks/useInvoices";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { StatCardsGridSkeleton } from "@/components/StatCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
    const { isConnected, address } = useAccount();
    const { balanceFormatted, totalReceivedFormatted, invoiceCount, scheduledCount, isLoading: statsLoading } = useUserStats();
    const { invoices, isLoading: invoicesLoading } = useInvoices();

    // Get recent invoices (last 5)
    const recentInvoices = invoices
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
        .slice(0, 5);

    // Get pending (unpaid) invoices
    const pendingInvoices = invoices.filter(inv => !inv.paid);
    const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0n);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome to AgentPay</h2>
                    <p className="text-muted-foreground">Connect your wallet to get started</p>
                </div>
                <ConnectButton />
            </div>
        );
    }

    const isLoading = statsLoading || invoicesLoading;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/invoices/new">Create Invoice</Link>
                    </Button>
                </div>
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
                        <StatCardsGridSkeleton />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                    >
                        <Card className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalReceivedFormatted}</div>
                                <p className="text-xs text-muted-foreground">From all paid invoices</p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-yellow-500/5 to-transparent" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                                <FileText className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pendingInvoices.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Worth ~{formatEther(pendingTotal)} MNT
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Scheduled Agents</CardTitle>
                                <Bot className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{scheduledCount}</div>
                                <p className="text-xs text-muted-foreground">Active automations</p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                                <img src="https://cryptologos.cc/logos/mantle-mnt-logo.png?v=035" alt="MNT" className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{balanceFormatted}</div>
                                <p className="text-xs text-muted-foreground truncate">{address?.slice(0, 10)}...</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Invoices</CardTitle>
                        <CardDescription>
                            {invoices.length} total invoices
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {invoicesLoading ? (
                                <motion.div
                                    key="skeleton"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between pb-2">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="size-9 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-3 w-12" />
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : recentInvoices.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No invoices yet</p>
                                    <Button asChild className="mt-4" variant="outline">
                                        <Link href="/invoices/new">Create your first invoice</Link>
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-4"
                                >
                                    {recentInvoices.map((invoice, idx) => (
                                        <motion.div
                                            key={invoice.id.toString()}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`size-9 rounded-full flex items-center justify-center ${invoice.creator.toLowerCase() === address?.toLowerCase()
                                                    ? 'bg-green-500/10'
                                                    : 'bg-blue-500/10'
                                                    }`}>
                                                    {invoice.creator.toLowerCase() === address?.toLowerCase() ? (
                                                        <ArrowUpRight className="size-5 text-green-500" />
                                                    ) : (
                                                        <ArrowDownLeft className="size-5 text-blue-500" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {invoice.creator.toLowerCase() === address?.toLowerCase() ? 'Invoice Sent' : 'Invoice Received'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {invoice.creator.toLowerCase() === address?.toLowerCase()
                                                            ? `to ${invoice.recipient.slice(0, 6)}...${invoice.recipient.slice(-4)}`
                                                            : `from ${invoice.creator.slice(0, 6)}...${invoice.creator.slice(-4)}`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{formatEther(invoice.amount)} MNT</div>
                                                <div className={`text-xs ${invoice.paid ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {invoice.paid ? 'Paid' : 'Pending'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Manage your payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild className="w-full justify-start" variant="outline">
                            <Link href="/invoices/new">
                                <FileText className="mr-2 size-4" /> Create New Invoice
                            </Link>
                        </Button>
                        <Button asChild className="w-full justify-start" variant="outline">
                            <Link href="/invoices">
                                <DollarSign className="mr-2 size-4" /> View All Invoices
                            </Link>
                        </Button>
                        <Button asChild className="w-full justify-start" variant="outline">
                            <Link href="/agents">
                                <Bot className="mr-2 size-4" /> Configure Agents
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
