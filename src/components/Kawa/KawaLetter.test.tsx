import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {KawaLetter} from './KawaLetter';

// Mock localStorage
const localStorageMock = (() => {
  let store: {[key: string]: string} = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('KawaLetter', () => {
  const letter = 'a';
  const index = 'test_1';
  const storageKey = `KawaItem_${letter}_${index}`;

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders a label with the capitalized letter and an input field', () => {
    render(<KawaLetter letter={letter} index={index} />);
    expect(screen.getByLabelText('A')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('loads text from localStorage on initial render', () => {
    localStorage.setItem(storageKey, JSON.stringify({text: 'Apple'}));
    render(<KawaLetter letter={letter} index={index} />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    expect(input.value).toBe('Apple');
  });

  it('updates input value and localStorage on change', () => {
    render(<KawaLetter letter={letter} index={index} />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    fireEvent.change(input, {target: {value: 'Airplane'}});
    expect(input.value).toBe('Airplane');
    expect(localStorage.getItem(storageKey)).toBe(JSON.stringify({text: 'Airplane'}));
  });

  it('calls onChangeText callback when text changes', () => {
    const onChangeText = vi.fn();
    render(<KawaLetter letter={letter} index={index} onChangeText={onChangeText} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'Ant'}});
    expect(onChangeText).toHaveBeenCalledWith('Ant');
  });
});
