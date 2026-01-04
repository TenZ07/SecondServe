import { Navigate } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth';

export default function PublicRoute({ children }) {
  const user = getUserFromToken();
  
  if (user) {
    return user.role === 'HOSTEL' ? 
      <Navigate to="/hostel" /> : 
      <Navigate to="/volunteer" />;
  }

  return children;
}