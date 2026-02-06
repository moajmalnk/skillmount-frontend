import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoading || !isAuthenticated || !user) return;

        // Bypass for Admins (They don't need onboarding)
        if (user.role === 'super_admin' || user.role === 'admin') return;

        // List of paths that are allowed even if profile is incomplete
        const publicPaths = ['/login', '/onboarding', '/google-callback', '/reset-password', '/contact'];

        // Check if current path is allowed
        const isAllowedPath = publicPaths.some(path => location.pathname.startsWith(path));

        if (!user.isProfileComplete && !isAllowedPath) {
            // Prevent infinite loop if already on onboarding
            if (location.pathname !== '/onboarding') {
                navigate('/onboarding', { replace: true });
            }
        }
    }, [user, isAuthenticated, isLoading, navigate, location]);

    if (isAuthenticated && user && !user.isProfileComplete && location.pathname !== '/onboarding') {
        // Bypass for Admins
        if (user.role === 'super_admin' || user.role === 'admin') {
            return <>{children}</>;
        }
        // Return null or a loader to "block" the view until redirect happens
        return null;
    }

    return <>{children}</>;
};
