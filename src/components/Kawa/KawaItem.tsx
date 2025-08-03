import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { KawaLetter } from './KawaLetter';
import { NewItemWithSaveKey } from '../NewStringItem';

export function KawaItem() {
  const { key } = useParams<{ key: string }>();
  const location = useLocation();
  const item = location.state?.item as NewItemWithSaveKey;

  useEffect(() => {
    if (item) {
      document.title = `Kawa für ${item.text}`;
    }
  }, [item]);

  if (!item) {
    // TODO: Handle case where item is not in location state, e.g. direct navigation
    // Could fetch from localStorage if needed
    return <div className="p-4 text-center">Kawa nicht gefunden. Bitte gehe zurück zur Übersicht.</div>;
  }

  const letters = item.text.split('');

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Kawa für "{item.text}"</h1>
      <div className="flex flex-col items-center space-y-4">
        {letters.map((letter, index) => (
          <KawaLetter
            key={index}
            letter={letter}
            index={`${item.key}_${index}`}
          />
        ))}
      </div>
    </div>
  );
}
