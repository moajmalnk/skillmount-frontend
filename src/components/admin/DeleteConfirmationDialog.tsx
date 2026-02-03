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
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string; // Optional: Name of the item being deleted
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone. This will permanently delete the item from the database.",
  itemName
}: DeleteConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="modal-layout-standard modal-sm">
        <AlertDialogHeader className="modal-header-standard">
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-2" asChild>
            <div className="modal-body-standard !p-0">
              {itemName && (
                <div className="bg-destructive/5 p-3 rounded-md border border-destructive/10 text-destructive-foreground font-medium text-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">Deleting: "{itemName}"</span>
                </div>
              )}
              <span className="block text-muted-foreground/90 leading-relaxed">{description}</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="modal-footer-standard">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6"
          >
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};