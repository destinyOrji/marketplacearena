import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders healthcare marketplace', () => {
  render(<App />);
  const titleElement = screen.getByText(/Your one-stop marketplace for healthcare in Nigeria/i);
  expect(titleElement).toBeInTheDocument();
});
