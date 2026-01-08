"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/lib/contracts";
import { formatEther } from "viem";
import { formatId } from "@/lib/utils";
import {
    Copy,
    Check,
    ExternalLink,
    Share2,
    User,
    Wallet,
    Calendar,
    Clock,
    FileText,
    Coins,
    XCircle,
    Loader2,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InvoiceDetailModalProps {
    invoice: Invoice | null;
    isOpen: boolean;
    onClose: () => void;
    userAddress?: string;
    onPay?: (invoiceId: bigint, amount: bigint) => Promise<void>;
    onCancel?: (invoiceId: bigint) => Promise<void>;
    isPaying?: boolean;
    isCancelling?: boolean;
}

export function InvoiceDetailModal({
    invoice,
    isOpen,
    onClose,
    userAddress,
    onPay,
    onCancel,
    isPaying,
    isCancelling,
}: InvoiceDetailModalProps) {
    const [copied, setCopied] = useState<string | null>(null);

    if (!invoice) return null;

    const isCreator = invoice.creator.toLowerCase() === userAddress?.toLowerCase();
    const canPay = !invoice.paid && !isCreator;
    const canCancel = !invoice.paid && isCreator;

    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatus = () => {
        if (invoice.paid) return { label: 'Paid', variant: 'default' as const, color: 'text-green-500' };
        const now = Math.floor(Date.now() / 1000);
        if (Number(invoice.dueDate) < now) return { label: 'Overdue', variant: 'destructive' as const, color: 'text-red-500' };
        return { label: 'Pending', variant: 'outline' as const, color: 'text-yellow-500' };
    };

    const status = getStatus();

    // Parse metadata for name if stored as JSON
    const parseMetadata = () => {
        try {
            const parsed = JSON.parse(invoice.metadataHash);
            return {
                name: parsed.name || null,
                description: parsed.description || '',
            };
        } catch {
            return {
                name: null,
                description: invoice.metadataHash,
            };
        }
    };

    const metadata = parseMetadata();

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const shareInvoice = () => {
        const shareUrl = `${window.location.origin}/invoices/${invoice.id.toString()}`;
        copyToClipboard(shareUrl, 'share');
    };

    const handlePay = async () => {
        if (onPay) {
            await onPay(invoice.id, invoice.amount);
        }
    };

    const handleCancel = async () => {
        if (onCancel) {
            await onCancel(invoice.id);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <FileText className="size-5" />
                            Invoice {formatId(invoice.id)}
                        </DialogTitle>
                        <Badge variant={status.variant} className="text-xs">
                            {status.label}
                        </Badge>
                    </div>
                    <DialogDescription>
                        {isCreator ? 'You created this invoice' : 'You received this invoice'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Amount Section */}
                    <div className="text-center p-6 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border">
                        <Coins className="size-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground mb-1">Amount</p>
                        <p className="text-4xl font-bold tracking-tight">
                            {formatEther(invoice.amount)} <span className="text-xl text-muted-foreground">MNT</span>
                        </p>
                    </div>

                    {/* Sender Info */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="size-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isCreator ? 'Sent to (Payee)' : 'Invoice From'}
                                </p>
                                {metadata.name && (
                                    <p className="font-semibold text-lg truncate">{metadata.name}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                    <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                        {isCreator
                                            ? `${invoice.recipient.slice(0, 10)}...${invoice.recipient.slice(-8)}`
                                            : `${invoice.creator.slice(0, 10)}...${invoice.creator.slice(-8)}`
                                        }
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6"
                                        onClick={() => copyToClipboard(isCreator ? invoice.recipient : invoice.creator, 'address')}
                                    >
                                        {copied === 'address' ? (
                                            <Check className="size-3 text-green-500" />
                                        ) : (
                                            <Copy className="size-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Counterparty Info */}
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                            <div className="size-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                <Wallet className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isCreator ? 'Created by (You)' : 'Pay To'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                        {isCreator
                                            ? `${invoice.creator.slice(0, 10)}...${invoice.creator.slice(-8)}`
                                            : `${invoice.creator.slice(0, 10)}...${invoice.creator.slice(-8)}`
                                        }
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6"
                                        onClick={() => copyToClipboard(invoice.creator, 'creator')}
                                    >
                                        {copied === 'creator' ? (
                                            <Check className="size-3 text-green-500" />
                                        ) : (
                                            <Copy className="size-3" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {metadata.description && (
                        <div className="p-4 rounded-lg border">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                            <p className="text-sm">{metadata.description}</p>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/30 border">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Clock className="size-4" />
                                <span className="text-xs font-medium">Created</span>
                            </div>
                            <p className="text-sm font-medium">{formatDate(invoice.createdAt)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(invoice.createdAt)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30 border">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Calendar className="size-4" />
                                <span className="text-xs font-medium">Due Date</span>
                            </div>
                            <p className={`text-sm font-medium ${status.color}`}>{formatDate(invoice.dueDate)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(invoice.dueDate)}</p>
                        </div>
                    </div>

                    {/* Token Info */}
                    <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Token</p>
                        <div className="flex items-center gap-2">
                            {invoice.token === "0x0000000000000000000000000000000000000000" ? (
                                <>
                                    <div className="size-6 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">M</span>
                                    </div>
                                    <span className="font-medium">MNT (Native Token)</span>
                                </>
                            ) : (
                                <>
                                    <code className="text-xs font-mono">{invoice.token}</code>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={shareInvoice}
                        >
                            {copied === 'share' ? (
                                <>
                                    <Check className="size-4 mr-2 text-green-500" />
                                    Link Copied!
                                </>
                            ) : (
                                <>
                                    <Share2 className="size-4 mr-2" />
                                    Share Invoice
                                </>
                            )}
                        </Button>

                        {canPay && (
                            <Button
                                className="flex-1 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                onClick={handlePay}
                                disabled={isPaying}
                            >
                                {isPaying ? (
                                    <>
                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="size-4 mr-2" />
                                        Pay {formatEther(invoice.amount)} MNT
                                    </>
                                )}
                            </Button>
                        )}

                        {canCancel && (
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleCancel}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="size-4 mr-2" />
                                        Cancel Invoice
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* View on Explorer */}
                    <div className="text-center">
                        <Button
                            variant="link"
                            className="text-xs text-muted-foreground"
                            onClick={() => window.open(`https://explorer.sepolia.mantle.xyz/address/${invoice.creator}`, '_blank')}
                        >
                            <ExternalLink className="size-3 mr-1" />
                            View on Mantle Explorer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
