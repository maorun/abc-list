import React, { useState } from 'react';
import { DeleteConfirm } from '../DeleteConfirm';

interface SavedWordProps {
  text: string;
  onDelete?: () => void;
}

export function SavedWord({ text, onDelete }: SavedWordProps) {
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = () => {
    setShowDelete(false);
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="my-1">
      <div
        className="p-2 border rounded cursor-pointer hover:bg-gray-100"
        onClick={() => setShowDelete(true)}
      >
        {text}
      </div>
      <DeleteConfirm
        itemToDelete={text}
        isVisible={showDelete}
        onAbort={() => setShowDelete(false)}
        onDelete={handleDelete}
      />
    </div>
  );
}
