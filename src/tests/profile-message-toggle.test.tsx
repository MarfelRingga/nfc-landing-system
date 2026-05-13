/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from '../app/(dashboard)/profile/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { 
        id: 'test-user-id', 
        username: 'test', 
        message_placeholder_name: 'Name',
        allow_messages: true
      }, error: null }),
    })),
  },
}));

describe('ProfilePage - Message Section Toggle', () => {
  it('should render the toggle switch for message section', async () => {
    render(<ProfilePage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Message Box Settings/i)).not.toBeNull();
    });

    const toggleLabel = screen.queryByText(/Enable Message Box/i);
    expect(toggleLabel).not.toBeNull();
  });
});
