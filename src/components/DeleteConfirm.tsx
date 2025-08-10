import React from "react";
import {Button} from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface DeleteConfirmProps<T> {
  itemToDelete: T;
  onDelete?: (itemToDelete: T) => void;
  onAbort: () => void;
  isVisible: boolean;
}

// Extracted function handlers to prevent recreation on every render
const handleDeleteAction = (
  itemToDelete: unknown,
  onDelete?: (itemToDelete: unknown) => void,
  onAbort?: () => void,
) => () => {
  if (onDelete) {
    onDelete(itemToDelete);
  } else if (onAbort) {
    onAbort();
  }
};

const handleDialogChangeAction = (onAbort: () => void) => (open: boolean) => {
  if (!open) onAbort();
};

export function DeleteConfirm<T>({
  itemToDelete,
  onDelete,
  onAbort,
  isVisible,
}: DeleteConfirmProps<T>) {
  // Create stable function references inside component
  const handleDelete = handleDeleteAction(
    itemToDelete,
    onDelete as ((itemToDelete: unknown) => void) | undefined,
    onAbort,
  );
  const handleDialogChange = handleDialogChangeAction(onAbort);

  return (
    <Dialog open={isVisible} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Löschen bestätigen</DialogTitle>
          <DialogDescription>
            Möchten Sie dieses Element wirklich löschen? Diese Aktion kann nicht
            rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onAbort}>
            Nein
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Ja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
