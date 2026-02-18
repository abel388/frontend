import { render, screen, fireEvent } from '@testing-library/react';
import SignIn from '../../../../src/app/auth/signin/page';
import { useRouter } from 'next/navigation';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('SignIn Page', () => {
    it('redirects to home page', () => {
        const mockReplace = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
        render(<SignIn />);
        
        expect(mockReplace).toHaveBeenCalledWith('/');
    });
});