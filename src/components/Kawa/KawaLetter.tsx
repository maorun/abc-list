import React, {useState, useEffect, useMemo} from "react";
import {Input} from "../ui/input";

interface KawaLetterProps {
  letter: string;
  index: string;
  onChangeText?: (text: string) => void;
}

// Extracted function handlers to prevent recreation on every render
const handleTextChangeAction = (
  setText: (text: string) => void,
  storageKey: string,
  onChangeText?: (text: string) => void,
) => (newText: string) => {
  setText(newText);
  localStorage.setItem(storageKey, JSON.stringify({text: newText}));
  if (onChangeText) {
    onChangeText(newText);
  }
};

export function KawaLetter({letter, index, onChangeText}: KawaLetterProps) {
  const [text, setText] = useState("");

  // Use useMemo to prevent recreation of storageKey on every render
  const storageKey = useMemo(() => `KawaItem_${letter}_${index}`, [letter, index]);

  useEffect(() => {
    const storedText = localStorage.getItem(storageKey);
    if (storedText) {
      setText(JSON.parse(storedText).text);
    }
  }, [storageKey]);

  // Create stable function reference inside component
  const handleTextChange = handleTextChangeAction(setText, storageKey, onChangeText);

  const inputId = `kawa-letter-input-${index}`;
  return (
    <div className="flex items-center space-x-4 w-full md:w-1/2">
      <label htmlFor={inputId} className="text-2xl font-bold w-8">
        {letter.toUpperCase()}
      </label>
      <Input
        id={inputId}
        type="text"
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
}
