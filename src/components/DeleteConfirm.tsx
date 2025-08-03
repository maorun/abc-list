import React from 'react';

interface DeleteConfirmProps<T> {
  itemToDelete: T;
  onDelete?: (itemToDelete: T) => void;
  onAbort: () => void;
  isVisible: boolean;
}

export function DeleteConfirm<T>({ itemToDelete, onDelete, onAbort, isVisible }: DeleteConfirmProps<T>) {
  if (!isVisible) {
    return null;
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(itemToDelete);
    } else {
      onAbort();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center">
        <h2 className="text-xl font-bold mb-4">Wirklich löschen?</h2>
        <div className="flex justify-center space-x-4">
          <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Ja
          </button>
          <button onClick={onAbort} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Nein
          </button>
        </div>
      </div>
    </div>
  );
}
