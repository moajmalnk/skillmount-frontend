import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoading || !isAuthenticated || !user) return;

        // List of paths that are allowed even if profile is incomplete
        const publicPaths = ['/login', '/onboarding', '/google-callback', '/reset-password', '/contact'];
        // Allow public home page? User said "not access to any tabe", implying strict lock.
        // Usually landing page might be open, but let's strictly follow "mandatory for incomplete profile".
        // If they are logged in, they MUST complete onboarding.

        // Check if current path is allowed
        const isAllowedPath = publicPaths.some(path => location.pathname.startsWith(path));

        if (!user.isProfileComplete && !isAllowedPath) {
            // Prevent infinite loop if already on onboarding
            if (location.pathname !== '/onboarding') {
                navigate('/onboarding', { replace: true });
            }
        }
    }, [user, isAuthenticated, isLoading, navigate, location]);

    // If loading or checking, we can show a loader or just nothing (while initial auth check happens)
    // But usually we just render children and let the effect redirect if needed.
    // To strictly hide content, we should return null if blocking.

    if (isAuthenticated && user && !user.isProfileComplete && location.pathname !== '/onboarding') {
        // Return null or a loader to "block" the view until redirect happens
        return null;
    }

    return <>{children}</>;
};
