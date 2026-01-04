// src/pages/Home.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      // Redirect to their dashboard
      navigate(user.role === 'HOSTEL' ? '/hostel' : '/volunteer');
    }
  }, [navigate]);

  // If not logged in, show login/register
  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-violet-50 to-gray-100">
      <h1 className="text-4xl font-bold text-violet-800 mb-6">Food Wastage MVP</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Connect hostels with excess food to volunteers for redistribution.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={handleLogin}
          className="px-6 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition"
        >
          Login
        </button>
        <button
          onClick={handleRegister}
          className="px-6 py-2 bg-white border border-violet-600 text-violet-600 rounded hover:bg-violet-50 transition"
        >
          Register
        </button>
      </div>
    </div>
  );
}