import { Navigate } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth';

export default function ProtectedRoute({ children, allowedRoles = ['HOSTEL', 'VOLUNTEER'] }) {
  const user = getUserFromToken();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}