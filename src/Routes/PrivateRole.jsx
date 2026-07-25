import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ROUTES } from '../constants/routePaths';

const PrivateRole = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }
    
    try {
        const decoded = jwtDecode(token);
        const userRole = decoded.role || decoded.Role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        
        if (!allowedRoles.includes(userRole)) {
            return <Navigate to={ROUTES.HOME} replace />;
        }
        
        return children;
    } catch (error) {
        localStorage.removeItem('token');
        return <Navigate to={ROUTES.LOGIN} replace />;
    }
};

export default PrivateRole;
