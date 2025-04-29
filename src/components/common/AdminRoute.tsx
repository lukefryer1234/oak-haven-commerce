import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { UserRole } from '../../types';
import LoadingSpinner from './LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner message="Checking authorization..." />;
  }

  // If not authenticated or not an admin, redirect
  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If authenticated and is admin, render the protected component
  return <>{children}</>;
};

export default AdminRoute;

