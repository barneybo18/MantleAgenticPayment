"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Loader2, FileText } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { usePayInvoice } from "@/hooks/usePayInvoice";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { InvoiceTableSkeleton } from "@/components/InvoiceTableSkeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function InvoicesPage() {
    const { isConnected, address } = useAccount();
    const { invoices, isLoading, refetch } = useInvoices();
    const { payInvoice, isPending: paying } = usePayInvoice();
    const [payingId, setPayingId] = useState<bigint | null>(null);

    const handlePay = async (invoiceId: bigint, amount: bigint) => {
        setPayingId(invoiceId);
        try {
            await payInvoice(invoiceId, amount);
            // Wait a bit for tx to confirm then refetch
            setTimeout(() => {
                refetch();
                setPayingId(null);
            }, 2000);
        } catch (e) {
            setPayingId(null);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                    <p className="text-muted-foreground">Connect your wallet to view invoices</p>
                </div>
                <ConnectButton />
            </div>
        );
    }

    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatus = (invoice: { paid: boolean; dueDate: bigint }) => {
        if (invoice.paid) return { label: 'Paid', variant: 'default' as const };
        const now = Math.floor(Date.now() / 1000);
        if (Number(invoice.dueDate) < now) return { label: 'Overdue', variant: 'destructive' as const };
        return { label: 'Pending', variant: 'outline' as const };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                <Button asChild>
                    <Link href="/invoices/new">
                        <Plus className="mr-2 h-4 w-4" /> Create Invoice
                    </Link>
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-md border"
                    >
                        <InvoiceTableSkeleton />
                    </motion.div>
                ) : invoices.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 border rounded-lg"
                    >
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground mb-4">No invoices yet</p>
                        <Button asChild>
                            <Link href="/invoices/new">Create your first invoice</Link>
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-md border"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Counterparty</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice, idx) => {
                                    const status = getStatus(invoice);
                                    const isCreator = invoice.creator.toLowerCase() === address?.toLowerCase();
                                    const canPay = !invoice.paid && !isCreator;

                                    return (
                                        <motion.tr
                                            key={invoice.id.toString()}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-b transition-colors hover:bg-muted/50"
                                        >
                                            <TableCell className="font-mono text-xs">#{invoice.id.toString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={isCreator ? "secondary" : "outline"}>
                                                    {isCreator ? 'Sent' : 'Received'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={status.variant}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {isCreator
                                                    ? `${invoice.recipient.slice(0, 6)}...${invoice.recipient.slice(-4)}`
                                                    : `${invoice.creator.slice(0, 6)}...${invoice.creator.slice(-4)}`
                                                }
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatEther(invoice.amount)} MNT
                                            </TableCell>
                                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                            <TableCell className="text-right">
                                                {canPay ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handlePay(invoice.id, invoice.amount)}
                                                        disabled={paying && payingId === invoice.id}
                                                    >
                                                        {paying && payingId === invoice.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            'Pay Now'
                                                        )}
                                                    </Button>
                                                ) : invoice.paid ? (
                                                    <span className="text-green-500 text-sm">✓ Paid</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Awaiting payment</span>
                                                )}
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
