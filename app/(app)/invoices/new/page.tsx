"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ChevronLeft, Loader2, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useCreateInvoice } from "@/hooks/useCreateInvoice";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function NewInvoicePage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const { createInvoice, isPending, isSuccess, hash, error } = useCreateInvoice();

    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [token, setToken] = useState("0x0000000000000000000000000000000000000000");
    const [date, setDate] = useState("");
    const [desc, setDesc] = useState("");

    // Set default due date to 7 days from now
    useEffect(() => {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        setDate(defaultDate.toISOString().split('T')[0]);
    }, []);

    // Redirect on success
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                router.push('/invoices');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, router]);

    const handleSubmit = async () => {
        if (!recipient || !amount || !date) return;

        // Validate address
        if (!recipient.startsWith('0x') || recipient.length !== 42) {
            alert('Please enter a valid Ethereum address');
            return;
        }

        const timestamp = Math.floor(new Date(date).getTime() / 1000);
        try {
            await createInvoice(recipient, amount, token, desc, timestamp);
        } catch (e) {
            console.error(e);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Create Invoice</h2>
                    <p className="text-muted-foreground">Connect your wallet to create invoices</p>
                </div>
                <ConnectButton />
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
                <Card className="border-green-500/50">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                            <h3 className="text-2xl font-bold">Invoice Created!</h3>
                            <p className="text-muted-foreground">
                                Your invoice has been created on-chain.
                            </p>
                            {hash && (
                                <p className="text-xs text-muted-foreground font-mono">
                                    Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground">Redirecting to invoices...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/invoices"><ChevronLeft className="size-4" /></Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">New Invoice</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice Details</CardTitle>
                    <CardDescription>Create a new on-chain payment request.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient Wallet *</Label>
                        <Input
                            id="recipient"
                            placeholder="0x..."
                            value={recipient}
                            onChange={e => setRecipient(e.target.value)}
                            className={recipient && (!recipient.startsWith('0x') || recipient.length !== 42) ? 'border-red-500' : ''}
                        />
                        {recipient && (!recipient.startsWith('0x') || recipient.length !== 42) && (
                            <p className="text-xs text-red-500">Please enter a valid address</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (MNT) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.001"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="token">Token</Label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                            >
                                <option value="0x0000000000000000000000000000000000000000">MNT (Native)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date *</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description / Items</Label>
                        <Textarea
                            id="description"
                            placeholder="Invoice for consulting services, etc..."
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md">
                            <p className="text-red-500 text-sm">Error: {error.message}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/invoices">Cancel</Link>
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !recipient || !amount || !date}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending ? "Creating..." : "Create Invoice"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
