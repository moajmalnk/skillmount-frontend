import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoading || !isAuthenticated || !user) return;

        // Bypass for 'super_admin', 'admin'
        const immuneRoles = ['super_admin', 'admin'];
        if (immuneRoles.includes(user.role)) return;

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
        const immuneRoles = ['super_admin', 'admin'];
        if (immuneRoles.includes(user.role)) {
            return <>{children}</>;
        }
        // Return null to block view until redirect happens
        return null;
    }

    return <>{children}</>;
};
