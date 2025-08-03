import React, { useState, useEffect } from 'react';

interface KawaLetterProps {
  letter: string;
  index: string;
  onChangeText?: (text: string) => void;
}

export function KawaLetter({ letter, index, onChangeText }: KawaLetterProps) {
  const [text, setText] = useState('');

  const getStorageKey = () => `KawaItem_${letter}_${index}`;

  useEffect(() => {
    const storedText = localStorage.getItem(getStorageKey());
    if (storedText) {
      setText(JSON.parse(storedText).text);
    }
  }, [letter, index]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    localStorage.setItem(getStorageKey(), JSON.stringify({ text: newText }));
    if (onChangeText) {
      onChangeText(newText);
    }
  };

  return (
    <div className="flex items-center space-x-4 w-full md:w-1/2">
      <label className="text-2xl font-bold w-8">{letter.toUpperCase()}</label>
      <input
        type="text"
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  );
}
