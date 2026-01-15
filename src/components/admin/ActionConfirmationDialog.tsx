import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle2, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "destructive" | "warning" | "success";
    itemName?: string;
}

export const ActionConfirmationDialog = ({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    itemName
}: ActionConfirmationDialogProps) => {

    const getVariantStyles = () => {
        switch (variant) {
            case "destructive":
                return {
                    icon: Trash2,
                    iconColor: "text-destructive",
                    buttonClass: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                    headerClass: "text-destructive"
                };
            case "success":
                return {
                    icon: CheckCircle2,
                    iconColor: "text-green-600",
                    buttonClass: "bg-green-600 hover:bg-green-700 text-white",
                    headerClass: "text-green-600"
                };
            case "warning":
                return {
                    icon: AlertCircle,
                    iconColor: "text-amber-600",
                    buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
                    headerClass: "text-amber-600"
                };
            default: // default/info
                return {
                    icon: Info,
                    iconColor: "text-primary",
                    buttonClass: "", // Default button styles
                    headerClass: "text-foreground"
                };
        }
    };

    const styles = getVariantStyles();
    const Icon = styles.icon;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className={cn("flex items-center gap-2", styles.headerClass)}>
                        <Icon className={cn("w-5 h-5", styles.iconColor)} />
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3 pt-2">
                        {itemName && (
                            <div className="bg-muted/50 p-3 rounded-md border border-border/50 font-medium text-sm flex items-center gap-2 text-foreground/80">
                                <span className="text-muted-foreground font-normal">Item:</span>
                                {itemName}
                            </div>
                        )}
                        <div className="text-muted-foreground/90 leading-relaxed">
                            {description}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className={cn("sm:px-6", styles.buttonClass)}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
