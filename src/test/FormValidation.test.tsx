import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingSection } from '@/components/landing/BookingSection';
import { toast } from 'sonner';
import '@/test/supabaseMock';

// Mock Sonner Toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('SECURE HEALTH HUB - Booking Section Validation', () => {
  it('prevents submission if mandatory fields are missing', () => {
    render(<BookingSection />);
    const submitBtn = screen.getByText(/SCHEDULE NOW/i);
    
    // Attempt empty submission
    fireEvent.click(submitBtn);
    
    expect(toast.error).toHaveBeenCalledWith("MISSING FIELDS", expect.anything());
  });

  it('prevents submission if the date is in the past', () => {
    render(<BookingSection />);
    
    // Fill other mandatory fields
    fireEvent.change(screen.getByPlaceholderText(/Full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Phone number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cardiology' } });
    
    // Set a past date
    const pastDate = '2020-01-01';
    fireEvent.change(screen.getByLabelText(/Appointment Date\*/i), { target: { value: pastDate } });
    
    const submitBtn = screen.getByText(/SCHEDULE NOW/i);
    fireEvent.click(submitBtn);
    
    expect(toast.error).toHaveBeenCalledWith("INVALID DATE", expect.anything());
  });

  it('submits successfully with valid future date and phone', () => {
    render(<BookingSection />);
    
    // Fill all fields correctly
    fireEvent.change(screen.getByPlaceholderText(/Full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Phone number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cardiology' } });
    
    // Set a future date
    const futureDate = '2030-12-31';
    fireEvent.change(screen.getByLabelText(/Appointment Date\*/i), { target: { value: futureDate } });
    
    const submitBtn = screen.getByText(/SCHEDULE NOW/i);
    fireEvent.click(submitBtn);
    
    expect(toast.success).toHaveBeenCalledWith("APPOINTMENT RECEIVED", expect.anything());
  });
});
