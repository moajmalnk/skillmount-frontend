import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

export const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) return;

        // Check if previously dismissed (First time only check)
        const hasSeenPrompt = localStorage.getItem('pwa_install_prompt_seen');
        if (hasSeenPrompt) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        if (isIosDevice) {
            // Logic for iOS (Show after a small delay)
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 3000);
            return () => clearTimeout(timer);
        }

        // Logic for Android/Chrome
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsOpen(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        setDeferredPrompt(null);
        setIsOpen(false);
        localStorage.setItem('pwa_install_prompt_seen', 'true');
    };

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem('pwa_install_prompt_seen', 'true');
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl bg-zinc-950">
                <div className="bg-gradient-to-br from-[#7e22ce] to-[#6b21a8] p-6 text-white text-center relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner ring-1 ring-white/30">
                            <img
                                src="/pwa-192x192.png"
                                alt="Logo"
                                className="w-10 h-10 object-contain drop-shadow-md"
                                onError={(e) => e.currentTarget.style.display = 'none'} // Fallback if no image
                            />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white mb-2">
                            Install SkillMount App
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm max-w-[260px]">
                            Get the full experience with faster access, offline mode, and push notifications.
                        </DialogDescription>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div className="p-6 bg-background space-y-4">
                    {isIOS ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                                <Share className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">Step 1</p>
                                    <p className="text-xs text-muted-foreground">Tap the <span className="font-semibold text-foreground">Share</span> button in your browser menu.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                                <div className="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-xs font-bold">+</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">Step 2</p>
                                    <p className="text-xs text-muted-foreground">Select <span className="font-semibold text-foreground">Add to Home Screen</span> from the options. </p>
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleDismiss}>
                                Got it
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            <Button
                                onClick={handleInstall}
                                className="w-full h-11 text-base font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all hover:scale-[1.02] bg-white text-black hover:bg-gray-100"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Install Now
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleDismiss}
                                className="w-full text-muted-foreground hover:text-foreground"
                            >
                                Maybe Later
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
