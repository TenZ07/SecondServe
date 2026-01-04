// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';

export default function ProtectedRoute({ children, allowedRoles = ['HOSTEL', 'VOLUNTEER'] }) {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}