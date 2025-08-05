import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {List, cacheKey} from './List';

// Mock localStorage
const localStorageMock = (() => {
  let store: {[key: string]: string} = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('List', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedNavigate.mockClear();
  });

  it('should load and display items from localStorage', () => {
    const testData = ['Liste 1', 'Liste 2'];
    localStorage.setItem(cacheKey, JSON.stringify(testData));
    render(<List />, {wrapper: MemoryRouter});
    expect(screen.getByText('Liste 1')).toBeInTheDocument();
    expect(screen.getByText('Liste 2')).toBeInTheDocument();
  });

  it('should delete an item when delete button is clicked', () => {
    const testData = ['Liste 1', 'Liste 2'];
    localStorage.setItem(cacheKey, JSON.stringify(testData));
    localStorage.setItem('abcList-Liste 1', 'some-data');
    render(<List />, {wrapper: MemoryRouter});

    const deleteButton = screen.getAllByRole('button', {name: 'X'})[0];
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Liste 1')).not.toBeInTheDocument();
    expect(screen.getByText('Liste 2')).toBeInTheDocument();
    expect(localStorage.getItem(cacheKey)).toBe(JSON.stringify(['Liste 2']));
    expect(localStorage.getItem('abcList-Liste 1')).toBeNull();
  });

  it('should navigate to the item page on click', () => {
    const testData = ['Liste 1'];
    localStorage.setItem(cacheKey, JSON.stringify(testData));
    render(<List />, {wrapper: MemoryRouter});

    fireEvent.click(screen.getByRole('button', {name: 'Liste 1'}));
    expect(mockedNavigate).toHaveBeenCalledWith('/list/Liste 1');
  });

  it('should create a new item and navigate to it', () => {
    render(<List />, {wrapper: MemoryRouter});

    // Simulate creating a new item through NewStringItem
    fireEvent.click(screen.getByRole('button', {name: 'Neue ABC-Liste'}));

    const input = screen.getByPlaceholderText('Enter text...');
    fireEvent.change(input, {target: {value: 'Neue Liste'}});
    fireEvent.click(screen.getByRole('button', {name: 'Speichern'}));

    expect(screen.getByText('Neue Liste')).toBeInTheDocument();
    expect(localStorage.getItem(cacheKey)).toBe(JSON.stringify(['Neue Liste']));
    expect(mockedNavigate).toHaveBeenCalledWith('/list/Neue Liste');
  });
});
