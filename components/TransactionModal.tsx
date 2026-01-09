"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { getExplorerUrl } from "@/lib/mantle";
import { useChainId } from "wagmi";

export type TransactionState = 'idle' | 'confirming' | 'pending' | 'success' | 'error';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel?: () => void;
    state: TransactionState;
    title?: string;
    description?: string;
    txHash?: string;
    error?: string;
    successMessage?: string;
    onSuccessAction?: () => void;
    successActionLabel?: string;
}

export function TransactionModal({
    isOpen,
    onClose,
    onCancel,
    state,
    title = "Transaction",
    description,
    txHash,
    error,
    successMessage = "Transaction confirmed successfully!",
    onSuccessAction,
    successActionLabel = "Continue"
}: TransactionModalProps) {
    const chainId = useChainId();

    const getContent = () => {
        switch (state) {
            case 'confirming':
                return {
                    icon: <Loader2 className="size-12 text-primary animate-spin" />,
                    title: "Waiting for Confirmation",
                    description: description || "Please confirm the transaction in your wallet...",
                    showCancel: true
                };
            case 'pending':
                return {
                    icon: <Loader2 className="size-12 text-primary animate-spin" />,
                    title: "Transaction Pending",
                    description: "Waiting for blockchain confirmation...",
                    showCancel: false
                };
            case 'success':
                return {
                    icon: <CheckCircle2 className="size-12 text-green-500" />,
                    title: "Success!",
                    description: successMessage,
                    showCancel: false
                };
            case 'error':
                return {
                    icon: <XCircle className="size-12 text-destructive" />,
                    title: "Transaction Failed",
                    description: error || "Something went wrong. Please try again.",
                    showCancel: false
                };
            default:
                return null;
        }
    };

    const content = getContent();

    if (!content || state === 'idle') return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && state !== 'pending' && onClose()}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => { if (state === 'pending' || state === 'confirming') e.preventDefault(); }}>
                <DialogHeader className="text-center sm:text-center">
                    <div className="flex justify-center mb-4">
                        {content.icon}
                    </div>
                    <DialogTitle className="text-xl">{content.title}</DialogTitle>
                    <DialogDescription className="text-center">
                        {content.description}
                    </DialogDescription>
                </DialogHeader>

                {txHash && (state === 'pending' || state === 'success') && (
                    <div className="flex justify-center">
                        <a
                            href={getExplorerUrl(chainId, txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            View on Mantlescan
                            <ExternalLink className="size-3" />
                        </a>
                    </div>
                )}

                <DialogFooter className="sm:justify-center gap-2">
                    {content.showCancel && onCancel && (
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    {state === 'success' && (
                        <Button onClick={onSuccessAction || onClose}>
                            {successActionLabel}
                        </Button>
                    )}
                    {state === 'error' && (
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
