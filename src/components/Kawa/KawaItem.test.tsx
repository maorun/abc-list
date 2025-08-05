import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {KawaItem} from './KawaItem';
import {NewItemWithSaveKey} from '../NewStringItem';

// Mock the KawaLetter component
vi.mock('./KawaLetter', () => ({
  KawaLetter: ({letter, index}: {letter: string; index: string}) => (
    <div data-testid="kawa-letter">
      {letter} - {index}
    </div>
  ),
}));

import {useLocation} from 'react-router-dom';

// Mock useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

const mockedUseLocation = vi.mocked(useLocation);

describe('KawaItem', () => {
  const testKawa: NewItemWithSaveKey = {key: '123', text: 'Test'};
  const locationMock = {
    pathname: '',
    search: '',
    hash: '',
    key: 'default',
  };

  it('displays a "not found" message if no item is in location state', () => {
    mockedUseLocation.mockReturnValue({...locationMock, state: null});
    render(<KawaItem />, {wrapper: MemoryRouter});
    expect(screen.getByText('Kawa nicht gefunden. Bitte gehe zurück zur Übersicht.')).toBeInTheDocument();
  });

  it('renders title and sets document title when item is provided', () => {
    mockedUseLocation.mockReturnValue({...locationMock, state: {item: testKawa}});
    render(<KawaItem />, {wrapper: MemoryRouter});
    expect(screen.getByRole('heading', {name: `Kawa für "${testKawa.text}"`})).toBeInTheDocument();
    expect(document.title).toBe(`Kawa für ${testKawa.text}`);
  });

  it('renders a KawaLetter component for each letter', () => {
    mockedUseLocation.mockReturnValue({...locationMock, state: {item: testKawa}});
    render(<KawaItem />, {wrapper: MemoryRouter});
    const letterComponents = screen.getAllByTestId('kawa-letter');
    expect(letterComponents).toHaveLength(4); // "Test" has 4 letters
    expect(letterComponents[0]).toHaveTextContent('T - 123_0');
    expect(letterComponents[1]).toHaveTextContent('e - 123_1');
    expect(letterComponents[2]).toHaveTextContent('s - 123_2');
    expect(letterComponents[3]).toHaveTextContent('t - 123_3');
  });
});
