import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the main navigation links', () => {
    render(<App />);

    // Check for the main title of the app
    expect(screen.getByText('ABC-Listen App')).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByRole('link', {name: /Listen/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Kawas/i})).toBeInTheDocument();
  });
});
