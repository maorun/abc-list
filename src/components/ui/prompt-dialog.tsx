import React, {useState, useRef} from "react";
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

// Extract handler functions outside component
const createHandleConfirm =
  (
    onConfirm: (value: string) => void,
    setValue: (value: string) => void,
    value: string,
  ) =>
  () => {
    onConfirm(value);
    setValue("");
  };

const createHandleCancel =
  (onCancel: () => void, setValue: (value: string) => void) => () => {
    onCancel();
    setValue("");
  };

const createHandleKeyDown =
  (handleConfirm: () => void, handleCancel: () => void) =>
  (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

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

  const handleConfirm = createHandleConfirm(onConfirm, setValue, value);
  const handleCancel = createHandleCancel(onCancel, setValue);
  const handleKeyDown = createHandleKeyDown(handleConfirm, handleCancel);

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

// Extract prompt handler functions outside the hook
const createPromptFunction =
  (
    resolveRef: React.MutableRefObject<((value: string | null) => void) | null>,
    setConfig: (config: {
      title: string;
      description?: string;
      placeholder?: string;
      defaultValue?: string;
    }) => void,
    setIsOpen: (open: boolean) => void,
  ) =>
  (
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
  };

const createHandleConfirmHook =
  (
    resolveRef: React.MutableRefObject<((value: string | null) => void) | null>,
    setIsOpen: (open: boolean) => void,
    setConfig: (config: {title: string}) => void,
  ) =>
  (value: string) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setIsOpen(false);
    setConfig({title: ""});
  };

const createHandleCancelHook =
  (
    resolveRef: React.MutableRefObject<((value: string | null) => void) | null>,
    setIsOpen: (open: boolean) => void,
    setConfig: (config: {title: string}) => void,
  ) =>
  () => {
    resolveRef.current?.(null);
    resolveRef.current = null;
    setIsOpen(false);
    setConfig({title: ""});
  };

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
  const resolveRef = useRef<((value: string | null) => void) | null>(null);

  // Create stable handlers
  const prompt = createPromptFunction(resolveRef, setConfig, setIsOpen);
  const handleConfirm = createHandleConfirmHook(
    resolveRef,
    setIsOpen,
    setConfig,
  );
  const handleCancel = createHandleCancelHook(resolveRef, setIsOpen, setConfig);

  // Create PromptComponent directly without useMemo to avoid dependencies
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
