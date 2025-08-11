import React, {useState} from "react";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export interface NewItemWithSaveKey {
  key: string;
  text: string;
}

interface NewStringItemProps {
  title: string;
  onSave?: (item: NewItemWithSaveKey) => void;
  onAbort?: () => void;
}

// Extracted function handlers to prevent recreation on every render
const handleAbortAction =
  (
    setIsOpen: (open: boolean) => void,
    setNewItem: (item: string) => void,
    onAbort?: () => void,
  ) =>
  () => {
    setIsOpen(false);
    setNewItem("");
    if (onAbort) {
      onAbort();
    }
  };

const handleSaveAction =
  (
    newItem: string,
    handleAbort: () => void,
    onSave?: (item: NewItemWithSaveKey) => void,
  ) =>
  () => {
    if (onSave && newItem) {
      onSave({key: crypto.randomUUID(), text: newItem});
    }
    handleAbort();
  };

export function NewStringItem({title, onSave, onAbort}: NewStringItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState("");

  // Create stable function references inside component
  const handleAbort = handleAbortAction(setIsOpen, setNewItem, onAbort);
  const handleSave = handleSaveAction(newItem, handleAbort, onSave);

  return (
    <div className="my-4 text-center">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="bg-green-500 hover:bg-green-700"
            aria-label={`${title} - Dialog öffnen`}
          >
            {title}
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          aria-describedby="new-item-description"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription id="new-item-description">
              Geben Sie einen Namen für das neue Element ein.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newItem.trim()) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="Enter text..."
              className="col-span-3"
              aria-label="Name für neues Element"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleAbort}
              aria-label="Erstellung abbrechen"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={!newItem.trim()}
              aria-label="Element speichern"
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
