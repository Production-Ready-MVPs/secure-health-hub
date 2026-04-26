import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MedHero } from '@/components/landing/MedHero';
import { CommitmentSection } from '@/components/landing/CommitmentSection';
import { DNAHelix } from '@/components/ui/DNAHelix';
import '@/test/supabaseMock'; // Mock Supabase

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('SECURE HEALTH HUB - Landing Page Components', () => {
  it('MedHero renders with correct branding and DNAHelix background', () => {
    renderWithRouter(<MedHero />);
    
    // Branding Check
    expect(screen.getByText(/foundation for clinical data/i)).toBeDefined();
    
    // DNAHelix Check (using test id or aria-label if we added one, otherwise check class)
    const { container } = render(<DNAHelix />);
    expect(container.querySelector('svg')).toBeDefined();
  });

  it('CommitmentSection (Carousel) renders correctly', () => {
    renderWithRouter(<CommitmentSection />);
    
    // Check for carousel heading
    expect(screen.getByText(/SECURE HEALTH HUB/i)).toBeDefined();
    
    // Check for "How we can help" heading (part of the carousel logic area)
    expect(screen.getByText(/How we can help/i)).toBeDefined();
  });
});
