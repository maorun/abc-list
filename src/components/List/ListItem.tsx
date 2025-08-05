import React, {useEffect} from "react";
import {useParams} from "react-router-dom";
import {Letter} from "./Letter";

export function ListItem() {
  const {item} = useParams<{item: string}>();

  useEffect(() => {
    if (item) {
      document.title = `ABC-Liste für ${item}`;
    }
  }, [item]);

  const getCacheKey = (): string => {
    return "abcList-" + item;
  };

  const alphabet = Array.from({length: 26}, (_, i) =>
    String.fromCharCode(97 + i),
  );

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        ABC-Liste für {item}
      </h1>
      <div className="flex flex-row flex-wrap justify-around gap-4">
        {alphabet.map((char) => (
          <div key={char} className="m-2">
            <Letter letter={char} cacheKey={getCacheKey()} />
          </div>
        ))}
      </div>
    </div>
  );
}
