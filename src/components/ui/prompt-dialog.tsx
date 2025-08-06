import React, {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptDialog({
  isOpen,
  title,
  description,
  placeholder,
  defaultValue = "",
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  const handleConfirm = () => {
    onConfirm(value);
    setValue("");
  };

  const handleCancel = () => {
    onCancel();
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Abbrechen
          </Button>
          <Button onClick={handleConfirm}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for using the prompt dialog
export function usePrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
    resolve: ((value: string | null) => void) | null;
  }>({
    title: "",
    resolve: null,
  });

  const prompt = (
    title: string,
    description?: string,
    placeholder?: string,
    defaultValue?: string,
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      setConfig({
        title,
        description,
        placeholder,
        defaultValue,
        resolve,
      });
      setIsOpen(true);
    });
  };

  const handleConfirm = (value: string) => {
    config.resolve?.(value);
    setIsOpen(false);
    setConfig({title: "", resolve: null});
  };

  const handleCancel = () => {
    config.resolve?.(null);
    setIsOpen(false);
    setConfig({title: "", resolve: null});
  };

  const PromptComponent = () => (
    <PromptDialog
      isOpen={isOpen}
      title={config.title}
      description={config.description}
      placeholder={config.placeholder}
      defaultValue={config.defaultValue}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return {prompt, PromptComponent};
}
