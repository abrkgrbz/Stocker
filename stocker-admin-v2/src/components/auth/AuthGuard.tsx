import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../../utils/tokenStorage';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const isAuthenticated = !!tokenStorage.getToken();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};
