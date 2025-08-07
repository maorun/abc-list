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

export function DeleteConfirm<T>({
  itemToDelete,
  onDelete,
  onAbort,
  isVisible,
}: DeleteConfirmProps<T>) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(itemToDelete);
    } else {
      onAbort();
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && onAbort()}>
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
