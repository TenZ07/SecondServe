// src/components/PublicRoute.jsx
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';

export default function PublicRoute({ children }) {
  const user = getCurrentUser();
  
  if (user) {
    // Redirect to their dashboard
    return user.role === 'HOSTEL' ? 
      <Navigate to="/hostel" /> : 
      <Navigate to="/volunteer" />;
  }

  return children;
}