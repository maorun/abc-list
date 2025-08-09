import React, {useState, useCallback, useMemo} from "react";
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
  }>({
    title: "",
  });
  
  // Use useRef to store the resolve function to avoid dependency issues
  const resolveRef = React.useRef<((value: string | null) => void) | null>(null);

  const prompt = useCallback((
    title: string,
    description?: string,
    placeholder?: string,
    defaultValue?: string,
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfig({
        title,
        description,
        placeholder,
        defaultValue,
      });
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback((value: string) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setIsOpen(false);
    setConfig({title: ""});
  }, []); // No dependencies - stable callback

  const handleCancel = useCallback(() => {
    resolveRef.current?.(null);
    resolveRef.current = null;
    setIsOpen(false);
    setConfig({title: ""});
  }, []); // No dependencies - stable callback

  const PromptComponent = useMemo(() => () => (
    <PromptDialog
      isOpen={isOpen}
      title={config.title}
      description={config.description}
      placeholder={config.placeholder}
      defaultValue={config.defaultValue}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ), [isOpen, config.title, config.description, config.placeholder, config.defaultValue, handleConfirm, handleCancel]);

  return {prompt, PromptComponent};
}
