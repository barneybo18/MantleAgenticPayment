"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

export function WelcomePopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasShown, setHasShown] = useState(false);
    const pathname = usePathname();
    const { isConnected } = useAccount();

    useEffect(() => {
        // Only show on dashboard routes (not landing page)
        if (pathname === "/" || pathname === "") {
            return;
        }

        // Show popup if wallet is not connected and we haven't shown it yet this session
        if (!isConnected && !hasShown) {
            setIsOpen(true);
            setHasShown(true);
        }
    }, [pathname, isConnected, hasShown]);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center sm:text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 shadow-lg shadow-primary/30">
                        <span className="text-2xl font-bold text-primary-foreground">AP</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-foreground to-muted-foreground">
                        Welcome to AgentPay! 🎉
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Your gateway to autonomous, decentralized payments on Mantle Network.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">AI-Powered Agents</p>
                            <p className="text-xs text-muted-foreground">Automate recurring payments effortlessly</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Lightning Fast</p>
                            <p className="text-xs text-muted-foreground">Powered by Mantle Network</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Fully Decentralized</p>
                            <p className="text-xs text-muted-foreground">Non-custodial & transparent</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button onClick={handleClose} className="w-full sm:w-auto rounded-full shadow-lg shadow-primary/20">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
