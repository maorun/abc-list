import React, {useState} from 'react';

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
  const [isVisible, setIsVisible] = useState(false);
  const [newItem, setNewItem] = useState('');

  const handleAbort = () => {
    setIsVisible(false);
    setNewItem('');
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
      <button
        onClick={() => setIsVisible(true)}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        {title}
      </button>
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">{title}:</h2>
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter text..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Speichern
              </button>
              <button
                onClick={handleAbort}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
