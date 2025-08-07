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

export function NewStringItem({title, onSave, onAbort}: NewStringItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState("");

  const handleAbort = () => {
    setIsOpen(false);
    setNewItem("");
    if (onAbort) {
      onAbort();
    }
  };

  const handleSave = () => {
    if (onSave && newItem) {
      onSave({key: crypto.randomUUID(), text: newItem});
    }
    handleAbort();
  };

  return (
    <div className="my-4 text-center">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-green-500 hover:bg-green-700">
            {title}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Geben Sie einen Namen für das neue Element ein.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter text..."
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleAbort}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
