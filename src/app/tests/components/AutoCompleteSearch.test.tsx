import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AutoCompleteSearch from '../../components/AutoCompleteSearch';

describe('AutoCompleteSearch', () => {
  it('renders the search input and button', () => {
    render(<AutoCompleteSearch />);
    expect(screen.getByPlaceholderText('Enter city name or ZIP code')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('displays suggestions on input', async () => {
    render(<AutoCompleteSearch />);
    const input = screen.getByPlaceholderText('Enter city name or ZIP code');
    fireEvent.change(input, { target: { value: 'New' } });
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument();
    });
  });

  it('clears suggestions when input is empty', async () => {
    render(<AutoCompleteSearch />);
    const input = screen.getByPlaceholderText('Enter city name or ZIP code');
    
    // Type something first
    fireEvent.change(input, { target: { value: 'New' } });
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument();
    });
    
    // Clear the input
    fireEvent.change(input, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.queryByText('New York')).not.toBeInTheDocument();
    });
  });

  it('handles selection of a suggestion', async () => {
    render(<AutoCompleteSearch />);
    const input = screen.getByPlaceholderText('Enter city name or ZIP code');
    
    // Type to get suggestions
    fireEvent.change(input, { target: { value: 'New' } });
    
    // Wait for and click a suggestion
    await waitFor(() => {
      const suggestion = screen.getByText('New York');
      fireEvent.click(suggestion);
    });
    
    // Check if input value was updated
    expect(input).toHaveValue('New York');
  });
});